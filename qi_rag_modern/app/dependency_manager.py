"""
Dependency Management System for QiLife-Eos Modular Architecture
Handles shared dependencies, version conflicts, and multi-tenant isolation
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum
import pkg_resources
import importlib

from .config import Settings

logger = logging.getLogger(__name__)

class DependencyType(Enum):
    """Types of dependencies"""
    SINGLETON = "singleton"      # Must be single instance (React, React-DOM)
    SHARED = "shared"           # Can be shared across apps
    ISOLATED = "isolated"       # App-specific, not shared
    UTILITY = "utility"         # Shared utility libraries

class VersionStrategy(Enum):
    """Version management strategies"""
    CENTRALIZED = "centralized"  # Host controls all versions
    STRICT = "strict"           # Exact version matching required
    NEGOTIATED = "negotiated"   # Allow compatible version ranges
    FLEXIBLE = "flexible"       # Allow any compatible version

@dataclass
class DependencyInfo:
    """Information about a dependency"""
    name: str
    version: str
    type: DependencyType
    required_version: Optional[str] = None
    singleton: bool = False
    eager: bool = False
    fallback: Optional[str] = None
    metadata: Dict = field(default_factory=dict)

@dataclass
class DependencyConflict:
    """Information about a dependency conflict"""
    dependency_name: str
    requested_versions: List[str]
    conflicting_apps: List[str]
    severity: str  # "error", "warning", "info"
    resolution: Optional[str] = None

class DependencyManager:
    """Manages dependencies across the modular architecture"""
    
    def __init__(self):
        self.settings = Settings()
        self.dependencies: Dict[str, DependencyInfo] = {}
        self.app_dependencies: Dict[str, Set[str]] = {}
        self.conflicts: List[DependencyConflict] = []
        self.version_strategy = VersionStrategy.CENTRALIZED
        
        # Load dependency definitions
        self._load_dependency_definitions()
        self._load_app_dependencies()
    
    def _load_dependency_definitions(self):
        """Load predefined dependency definitions"""
        # Core singleton dependencies (must be single instance)
        singleton_deps = {
            "react": DependencyInfo(
                name="react",
                version="^18.3.0",
                type=DependencyType.SINGLETON,
                required_version="^18.3.0",
                singleton=True,
                eager=True
            ),
            "react-dom": DependencyInfo(
                name="react-dom",
                version="^18.3.0",
                type=DependencyType.SINGLETON,
                required_version="^18.3.0",
                singleton=True,
                eager=True
            ),
            "vue": DependencyInfo(
                name="vue",
                version="^3.4.0",
                type=DependencyType.SINGLETON,
                required_version="^3.4.0",
                singleton=True,
                eager=True
            )
        }
        
        # Shared utility dependencies
        shared_deps = {
            "lodash-es": DependencyInfo(
                name="lodash-es",
                version="^4.17.21",
                type=DependencyType.SHARED,
                required_version="^4.17.21",
                singleton=False,
                eager=False
            ),
            "axios": DependencyInfo(
                name="axios",
                version="^1.6.0",
                type=DependencyType.SHARED,
                required_version="^1.6.0",
                singleton=False,
                eager=False
            ),
            "date-fns": DependencyInfo(
                name="date-fns",
                version="^2.30.0",
                type=DependencyType.SHARED,
                required_version="^2.30.0",
                singleton=False,
                eager=False
            )
        }
        
        # Python dependencies
        python_deps = {
            "fastapi": DependencyInfo(
                name="fastapi",
                version="^0.104.0",
                type=DependencyType.SHARED,
                required_version="^0.104.0",
                singleton=False,
                eager=True
            ),
            "uvicorn": DependencyInfo(
                name="uvicorn",
                version="^0.24.0",
                type=DependencyType.SHARED,
                required_version="^0.24.0",
                singleton=False,
                eager=True
            ),
            "langchain": DependencyInfo(
                name="langchain",
                version="^0.1.0",
                type=DependencyType.SHARED,
                required_version="^0.1.0",
                singleton=False,
                eager=False
            ),
            "chromadb": DependencyInfo(
                name="chromadb",
                version="^0.4.0",
                type=DependencyType.SHARED,
                required_version="^0.4.0",
                singleton=False,
                eager=False
            ),
            "openai": DependencyInfo(
                name="openai",
                version="^1.3.0",
                type=DependencyType.SHARED,
                required_version="^1.3.0",
                singleton=False,
                eager=False
            )
        }
        
        # Combine all dependencies
        self.dependencies.update(singleton_deps)
        self.dependencies.update(shared_deps)
        self.dependencies.update(python_deps)
        
        logger.info(f"Loaded {len(self.dependencies)} dependency definitions")
    
    def _load_app_dependencies(self):
        """Load dependencies from app manifests"""
        try:
            miniapps_dir = Path("miniapps")
            if not miniapps_dir.exists():
                return
            
            for app_dir in miniapps_dir.iterdir():
                if app_dir.is_dir():
                    manifest_path = app_dir / "manifest.json"
                    if manifest_path.exists():
                        try:
                            with open(manifest_path, 'r') as f:
                                manifest_data = json.load(f)
                            
                            app_name = manifest_data["name"]
                            dependencies = manifest_data.get("dependencies", [])
                            
                            self.app_dependencies[app_name] = set(dependencies)
                            
                            # Validate dependencies
                            self._validate_app_dependencies(app_name, dependencies)
                            
                        except Exception as e:
                            logger.error(f"Failed to load dependencies for {app_dir.name}: {e}")
            
            logger.info(f"Loaded dependencies for {len(self.app_dependencies)} apps")
            
        except Exception as e:
            logger.error(f"Error loading app dependencies: {e}")
    
    def _validate_app_dependencies(self, app_name: str, dependencies: List[str]):
        """Validate dependencies for an app"""
        for dep_name in dependencies:
            if dep_name not in self.dependencies:
                logger.warning(f"Unknown dependency '{dep_name}' in app '{app_name}'")
                continue
            
            dep_info = self.dependencies[dep_name]
            
            # Check for singleton conflicts
            if dep_info.singleton:
                self._check_singleton_conflicts(app_name, dep_name, dep_info)
    
    def _check_singleton_conflicts(self, app_name: str, dep_name: str, dep_info: DependencyInfo):
        """Check for singleton dependency conflicts"""
        # This would be implemented to check if multiple apps are trying to use
        # different versions of the same singleton dependency
        pass
    
    def get_dependency_info(self, dep_name: str) -> Optional[DependencyInfo]:
        """Get information about a dependency"""
        return self.dependencies.get(dep_name)
    
    def get_app_dependencies(self, app_name: str) -> Set[str]:
        """Get dependencies for a specific app"""
        return self.app_dependencies.get(app_name, set())
    
    def get_shared_dependencies(self) -> Dict[str, DependencyInfo]:
        """Get all shared dependencies"""
        return {
            name: info for name, info in self.dependencies.items()
            if info.type in [DependencyType.SHARED, DependencyType.SINGLETON]
        }
    
    def get_singleton_dependencies(self) -> Dict[str, DependencyInfo]:
        """Get all singleton dependencies"""
        return {
            name: info for name, info in self.dependencies.items()
            if info.singleton
        }
    
    def check_version_compatibility(self, dep_name: str, version: str) -> bool:
        """Check if a version is compatible with the required version"""
        dep_info = self.dependencies.get(dep_name)
        if not dep_info or not dep_info.required_version:
            return True
        
        try:
            # Use pkg_resources to check version compatibility
            return pkg_resources.require(f"{dep_name}{dep_info.required_version}")[0].version == version
        except Exception:
            return False
    
    def resolve_dependency_conflicts(self) -> List[DependencyConflict]:
        """Resolve dependency conflicts across all apps"""
        conflicts = []
        
        # Check for singleton conflicts
        singleton_deps = self.get_singleton_dependencies()
        for dep_name, dep_info in singleton_deps.items():
            conflict = self._check_singleton_conflicts_across_apps(dep_name, dep_info)
            if conflict:
                conflicts.append(conflict)
        
        # Check for version conflicts
        shared_deps = self.get_shared_dependencies()
        for dep_name, dep_info in shared_deps.items():
            conflict = self._check_version_conflicts(dep_name, dep_info)
            if conflict:
                conflicts.append(conflict)
        
        self.conflicts = conflicts
        return conflicts
    
    def _check_singleton_conflicts_across_apps(self, dep_name: str, dep_info: DependencyInfo) -> Optional[DependencyConflict]:
        """Check for singleton conflicts across all apps"""
        apps_using_dep = [
            app_name for app_name, deps in self.app_dependencies.items()
            if dep_name in deps
        ]
        
        if len(apps_using_dep) > 1:
            return DependencyConflict(
                dependency_name=dep_name,
                requested_versions=[dep_info.required_version or dep_info.version],
                conflicting_apps=apps_using_dep,
                severity="error",
                resolution="Use centralized singleton from host"
            )
        
        return None
    
    def _check_version_conflicts(self, dep_name: str, dep_info: DependencyInfo) -> Optional[DependencyConflict]:
        """Check for version conflicts"""
        # This would implement version conflict detection
        # For now, return None (no conflicts detected)
        return None
    
    def generate_webpack_config(self, app_name: str, is_host: bool = False) -> Dict:
        """Generate webpack Module Federation configuration"""
        app_deps = self.get_app_dependencies(app_name)
        shared_config = {}
        
        for dep_name in app_deps:
            dep_info = self.get_dependency_info(dep_name)
            if not dep_info:
                continue
            
            if dep_info.type in [DependencyType.SHARED, DependencyType.SINGLETON]:
                shared_config[dep_name] = {
                    "singleton": dep_info.singleton,
                    "requiredVersion": dep_info.required_version or dep_info.version,
                    "eager": dep_info.eager
                }
        
        if is_host:
            return {
                "name": "host",
                "remotes": {
                    # Remote configurations would be added here
                },
                "shared": shared_config
            }
        else:
            return {
                "name": app_name,
                "filename": "remoteEntry.js",
                "exposes": {
                    # Component exposes would be added here
                },
                "shared": shared_config
            }
    
    def generate_python_requirements(self, app_name: str) -> List[str]:
        """Generate Python requirements for an app"""
        app_deps = self.get_app_dependencies(app_name)
        requirements = []
        
        for dep_name in app_deps:
            dep_info = self.get_dependency_info(dep_name)
            if not dep_info:
                continue
            
            # Only include Python dependencies
            if dep_info.type in [DependencyType.SHARED, DependencyType.SINGLETON]:
                requirements.append(f"{dep_name}{dep_info.required_version or dep_info.version}")
        
        return requirements
    
    def validate_installation(self, app_name: str) -> Dict[str, Any]:
        """Validate that all dependencies are properly installed"""
        app_deps = self.get_app_dependencies(app_name)
        validation_results = {
            "app_name": app_name,
            "status": "valid",
            "missing_deps": [],
            "version_mismatches": [],
            "conflicts": []
        }
        
        for dep_name in app_deps:
            dep_info = self.get_dependency_info(dep_name)
            if not dep_info:
                validation_results["missing_deps"].append(dep_name)
                continue
            
            # Check if dependency is installed
            try:
                if dep_info.type in [DependencyType.SHARED, DependencyType.SINGLETON]:
                    module = importlib.import_module(dep_name)
                    installed_version = getattr(module, '__version__', 'unknown')
                    
                    if not self.check_version_compatibility(dep_name, installed_version):
                        validation_results["version_mismatches"].append({
                            "dependency": dep_name,
                            "installed": installed_version,
                            "required": dep_info.required_version or dep_info.version
                        })
                        
            except ImportError:
                validation_results["missing_deps"].append(dep_name)
        
        # Check for conflicts
        conflicts = self.resolve_dependency_conflicts()
        app_conflicts = [
            conflict for conflict in conflicts
            if app_name in conflict.conflicting_apps
        ]
        validation_results["conflicts"] = app_conflicts
        
        # Update status
        if validation_results["missing_deps"] or validation_results["version_mismatches"] or validation_results["conflicts"]:
            validation_results["status"] = "invalid"
        
        return validation_results
    
    def install_dependencies(self, app_name: str, python_only: bool = False) -> bool:
        """Install dependencies for an app"""
        try:
            if python_only:
                requirements = self.generate_python_requirements(app_name)
                if requirements:
                    cmd = [sys.executable, "-m", "pip", "install"] + requirements
                    result = subprocess.run(cmd, capture_output=True, text=True)
                    if result.returncode != 0:
                        logger.error(f"Failed to install Python dependencies for {app_name}: {result.stderr}")
                        return False
            else:
                # This would handle npm/yarn installation for JavaScript dependencies
                pass
            
            logger.info(f"Successfully installed dependencies for {app_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error installing dependencies for {app_name}: {e}")
            return False
    
    def get_dependency_statistics(self) -> Dict[str, Any]:
        """Get statistics about dependencies"""
        total_deps = len(self.dependencies)
        singleton_deps = len(self.get_singleton_dependencies())
        shared_deps = len(self.get_shared_dependencies())
        
        app_dep_counts = {
            app_name: len(deps) for app_name, deps in self.app_dependencies.items()
        }
        
        return {
            "total_dependencies": total_deps,
            "singleton_dependencies": singleton_deps,
            "shared_dependencies": shared_deps,
            "app_dependency_counts": app_dep_counts,
            "conflicts": len(self.conflicts),
            "version_strategy": self.version_strategy.value
        }
    
    def update_dependency_version(self, dep_name: str, new_version: str) -> bool:
        """Update a dependency version"""
        if dep_name not in self.dependencies:
            return False
        
        dep_info = self.dependencies[dep_name]
        dep_info.version = new_version
        
        # Revalidate all apps that use this dependency
        for app_name in self.app_dependencies:
            if dep_name in self.app_dependencies[app_name]:
                validation = self.validate_installation(app_name)
                if validation["status"] == "invalid":
                    logger.warning(f"App {app_name} may have issues with updated {dep_name}")
        
        logger.info(f"Updated {dep_name} to version {new_version}")
        return True
    
    def export_dependency_config(self) -> Dict[str, Any]:
        """Export dependency configuration"""
        return {
            "version_strategy": self.version_strategy.value,
            "dependencies": {
                name: {
                    "version": info.version,
                    "type": info.type.value,
                    "required_version": info.required_version,
                    "singleton": info.singleton,
                    "eager": info.eager,
                    "metadata": info.metadata
                }
                for name, info in self.dependencies.items()
            },
            "app_dependencies": {
                app_name: list(deps) for app_name, deps in self.app_dependencies.items()
            },
            "conflicts": [
                {
                    "dependency_name": conflict.dependency_name,
                    "requested_versions": conflict.requested_versions,
                    "conflicting_apps": conflict.conflicting_apps,
                    "severity": conflict.severity,
                    "resolution": conflict.resolution
                }
                for conflict in self.conflicts
            ]
        }

# Global dependency manager instance
dependency_manager = DependencyManager()
