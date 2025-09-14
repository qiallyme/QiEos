"""
Modular Architecture for QiLife-Eos
Supports both orchestrated control and independent portable mini-apps
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Union, Callable
from dataclasses import dataclass, field
from enum import Enum

from .config import Settings

logger = logging.getLogger(__name__)

class AppMode(Enum):
    """Application modes"""
    ORCHESTRATED = "orchestrated"  # Part of main system
    INDEPENDENT = "independent"    # Standalone app
    HYBRID = "hybrid"             # Can work both ways

@dataclass
class MiniAppManifest:
    """Manifest for a mini-app"""
    name: str
    version: str
    description: str
    mode: AppMode
    entry_point: str
    dependencies: List[str] = field(default_factory=list)
    exposed_components: List[str] = field(default_factory=list)
    api_endpoints: List[str] = field(default_factory=list)
    config_schema: Dict = field(default_factory=dict)
    permissions: List[str] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)

@dataclass
class AppInstance:
    """Instance of a mini-app"""
    manifest: MiniAppManifest
    instance_id: str
    tenant_id: str
    config: Dict
    status: str = "active"
    created_at: datetime = field(default_factory=datetime.now)
    last_accessed: datetime = field(default_factory=datetime.now)

class ModularArchitecture:
    """Modular architecture manager for QiLife-Eos"""
    
    def __init__(self):
        self.settings = Settings()
        self.apps: Dict[str, MiniAppManifest] = {}
        self.instances: Dict[str, AppInstance] = {}
        self.component_registry: Dict[str, Callable] = {}
        self.api_registry: Dict[str, Callable] = {}
        
        # Load available mini-apps
        self._load_mini_apps()
    
    def _load_mini_apps(self):
        """Load available mini-apps from the miniapps directory"""
        try:
            miniapps_dir = Path("miniapps")
            if not miniapps_dir.exists():
                logger.warning("Miniapps directory not found")
                return
            
            for app_dir in miniapps_dir.iterdir():
                if app_dir.is_dir():
                    manifest_path = app_dir / "manifest.json"
                    if manifest_path.exists():
                        try:
                            with open(manifest_path, 'r') as f:
                                manifest_data = json.load(f)
                            
                            manifest = MiniAppManifest(
                                name=manifest_data["name"],
                                version=manifest_data["version"],
                                description=manifest_data["description"],
                                mode=AppMode(manifest_data["mode"]),
                                entry_point=manifest_data["entry_point"],
                                dependencies=manifest_data.get("dependencies", []),
                                exposed_components=manifest_data.get("exposed_components", []),
                                api_endpoints=manifest_data.get("api_endpoints", []),
                                config_schema=manifest_data.get("config_schema", {}),
                                permissions=manifest_data.get("permissions", []),
                                metadata=manifest_data.get("metadata", {})
                            )
                            
                            self.apps[manifest.name] = manifest
                            logger.info(f"Loaded mini-app: {manifest.name} v{manifest.version}")
                            
                        except Exception as e:
                            logger.error(f"Failed to load manifest for {app_dir.name}: {e}")
            
            logger.info(f"Loaded {len(self.apps)} mini-apps")
            
        except Exception as e:
            logger.error(f"Error loading mini-apps: {e}")
    
    def register_component(self, name: str, component: Callable):
        """Register a component for dynamic loading"""
        self.component_registry[name] = component
        logger.info(f"Registered component: {name}")
    
    def register_api_endpoint(self, name: str, handler: Callable):
        """Register an API endpoint handler"""
        self.api_registry[name] = handler
        logger.info(f"Registered API endpoint: {name}")
    
    def get_available_apps(self, tenant_id: Optional[str] = None) -> List[MiniAppManifest]:
        """Get available mini-apps for a tenant"""
        if not tenant_id:
            return list(self.apps.values())
        
        # Filter based on tenant permissions (implement as needed)
        return list(self.apps.values())
    
    def create_app_instance(
        self, 
        app_name: str, 
        tenant_id: str, 
        config: Optional[Dict] = None
    ) -> AppInstance:
        """Create a new instance of a mini-app"""
        if app_name not in self.apps:
            raise ValueError(f"Mini-app '{app_name}' not found")
        
        manifest = self.apps[app_name]
        instance_id = f"{app_name}_{tenant_id}_{datetime.now().timestamp()}"
        
        instance = AppInstance(
            manifest=manifest,
            instance_id=instance_id,
            tenant_id=tenant_id,
            config=config or {}
        )
        
        self.instances[instance_id] = instance
        logger.info(f"Created app instance: {instance_id}")
        
        return instance
    
    def get_app_instance(self, instance_id: str) -> Optional[AppInstance]:
        """Get an app instance by ID"""
        return self.instances.get(instance_id)
    
    def get_tenant_instances(self, tenant_id: str) -> List[AppInstance]:
        """Get all instances for a tenant"""
        return [
            instance for instance in self.instances.values()
            if instance.tenant_id == tenant_id
        ]
    
    def update_app_config(self, instance_id: str, config: Dict) -> bool:
        """Update configuration for an app instance"""
        if instance_id not in self.instances:
            return False
        
        self.instances[instance_id].config.update(config)
        self.instances[instance_id].last_accessed = datetime.now()
        logger.info(f"Updated config for instance: {instance_id}")
        return True
    
    def remove_app_instance(self, instance_id: str) -> bool:
        """Remove an app instance"""
        if instance_id not in self.instances:
            return False
        
        del self.instances[instance_id]
        logger.info(f"Removed app instance: {instance_id}")
        return True
    
    def get_orchestrated_ui_config(self, tenant_id: str) -> List[Dict]:
        """Get UI configuration for orchestrated mode"""
        instances = self.get_tenant_instances(tenant_id)
        ui_config = []
        
        for instance in instances:
            if instance.manifest.mode in [AppMode.ORCHESTRATED, AppMode.HYBRID]:
                for component in instance.manifest.exposed_components:
                    ui_config.append({
                        "component": component,
                        "instance_id": instance.instance_id,
                        "app_name": instance.manifest.name,
                        "props": {
                            "tenant_id": tenant_id,
                            "instance_id": instance.instance_id,
                            "config": instance.config,
                            **instance.config
                        }
                    })
        
        return ui_config
    
    async def execute_api_call(
        self, 
        endpoint: str, 
        tenant_id: str, 
        data: Optional[Dict] = None
    ) -> Any:
        """Execute an API call to a mini-app endpoint"""
        if endpoint not in self.api_registry:
            raise ValueError(f"API endpoint '{endpoint}' not found")
        
        handler = self.api_registry[endpoint]
        
        # Add tenant context
        context = {
            "tenant_id": tenant_id,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            if asyncio.iscoroutinefunction(handler):
                result = await handler(context, data or {})
            else:
                result = handler(context, data or {})
            
            return result
            
        except Exception as e:
            logger.error(f"API call failed for endpoint '{endpoint}': {e}")
            raise
    
    def get_app_dependencies(self, app_name: str) -> List[str]:
        """Get dependencies for a mini-app"""
        if app_name not in self.apps:
            return []
        
        return self.apps[app_name].dependencies
    
    def validate_app_config(self, app_name: str, config: Dict) -> bool:
        """Validate configuration against app schema"""
        if app_name not in self.apps:
            return False
        
        schema = self.apps[app_name].config_schema
        # Implement schema validation logic here
        return True
    
    def export_app_manifest(self, app_name: str) -> Optional[Dict]:
        """Export app manifest for external use"""
        if app_name not in self.apps:
            return None
        
        manifest = self.apps[app_name]
        return {
            "name": manifest.name,
            "version": manifest.version,
            "description": manifest.description,
            "mode": manifest.mode.value,
            "entry_point": manifest.entry_point,
            "dependencies": manifest.dependencies,
            "exposed_components": manifest.exposed_components,
            "api_endpoints": manifest.api_endpoints,
            "config_schema": manifest.config_schema,
            "permissions": manifest.permissions,
            "metadata": manifest.metadata
        }
    
    def import_app_manifest(self, manifest_data: Dict) -> bool:
        """Import an app manifest"""
        try:
            manifest = MiniAppManifest(
                name=manifest_data["name"],
                version=manifest_data["version"],
                description=manifest_data["description"],
                mode=AppMode(manifest_data["mode"]),
                entry_point=manifest_data["entry_point"],
                dependencies=manifest_data.get("dependencies", []),
                exposed_components=manifest_data.get("exposed_components", []),
                api_endpoints=manifest_data.get("api_endpoints", []),
                config_schema=manifest_data.get("config_schema", {}),
                permissions=manifest_data.get("permissions", []),
                metadata=manifest_data.get("metadata", {})
            )
            
            self.apps[manifest.name] = manifest
            logger.info(f"Imported app manifest: {manifest.name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to import app manifest: {e}")
            return False
    
    def get_app_statistics(self) -> Dict:
        """Get statistics about the modular architecture"""
        total_instances = len(self.instances)
        instances_by_app = {}
        instances_by_tenant = {}
        
        for instance in self.instances.values():
            # Count by app
            app_name = instance.manifest.name
            instances_by_app[app_name] = instances_by_app.get(app_name, 0) + 1
            
            # Count by tenant
            tenant_id = instance.tenant_id
            instances_by_tenant[tenant_id] = instances_by_tenant.get(tenant_id, 0) + 1
        
        return {
            "total_apps": len(self.apps),
            "total_instances": total_instances,
            "instances_by_app": instances_by_app,
            "instances_by_tenant": instances_by_tenant,
            "registered_components": len(self.component_registry),
            "registered_api_endpoints": len(self.api_registry)
        }

class MiniAppManager:
    """Manager for individual mini-apps"""
    
    def __init__(self, app_name: str, manifest: MiniAppManifest):
        self.app_name = app_name
        self.manifest = manifest
        self.components: Dict[str, Any] = {}
        self.api_handlers: Dict[str, Callable] = {}
        
    def register_component(self, name: str, component: Any):
        """Register a component for this mini-app"""
        if name in self.manifest.exposed_components:
            self.components[name] = component
            logger.info(f"Registered component '{name}' for app '{self.app_name}'")
        else:
            logger.warning(f"Component '{name}' not in exposed_components for app '{self.app_name}'")
    
    def register_api_handler(self, endpoint: str, handler: Callable):
        """Register an API handler for this mini-app"""
        if endpoint in self.manifest.api_endpoints:
            self.api_handlers[endpoint] = handler
            logger.info(f"Registered API handler '{endpoint}' for app '{self.app_name}'")
        else:
            logger.warning(f"API endpoint '{endpoint}' not in api_endpoints for app '{self.app_name}'")
    
    def get_component(self, name: str) -> Optional[Any]:
        """Get a registered component"""
        return self.components.get(name)
    
    def get_api_handler(self, endpoint: str) -> Optional[Callable]:
        """Get a registered API handler"""
        return self.api_handlers.get(endpoint)
    
    def can_run_independently(self) -> bool:
        """Check if this mini-app can run independently"""
        return self.manifest.mode in [AppMode.INDEPENDENT, AppMode.HYBRID]
    
    def can_run_orchestrated(self) -> bool:
        """Check if this mini-app can run in orchestrated mode"""
        return self.manifest.mode in [AppMode.ORCHESTRATED, AppMode.HYBRID]

# Global modular architecture instance
modular_arch = ModularArchitecture()
