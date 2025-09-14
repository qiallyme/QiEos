# Modular Architecture for QiLife-Eos

This document explains the modular architecture system that allows mini-apps to work both as independent units and as part of an orchestrated system.

## Overview

The QiLife-Eos modular architecture supports three modes of operation:

1. **Orchestrated Mode**: Mini-apps run as part of the main system with shared resources
2. **Independent Mode**: Mini-apps run as standalone applications
3. **Hybrid Mode**: Mini-apps can work in both modes

## Architecture Components

### 1. Mini-App Manifest

Each mini-app must have a `manifest.json` file that defines its capabilities:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "Description of the mini-app",
  "mode": "hybrid",
  "entry_point": "app.py",
  "dependencies": ["fastapi", "uvicorn"],
  "exposed_components": ["MyComponent", "AnotherComponent"],
  "api_endpoints": ["/api/endpoint1", "/api/endpoint2"],
  "config_schema": {
    "type": "object",
    "properties": {
      "api_key": {
        "type": "string",
        "description": "API key for the service"
      }
    },
    "required": ["api_key"]
  },
  "permissions": ["read_data", "write_data"],
  "metadata": {
    "category": "ai",
    "tags": ["machine-learning", "nlp"]
  }
}
```

### 2. App Modes

- **`orchestrated`**: Only works as part of the main system
- **`independent`**: Only works as a standalone app
- **`hybrid`**: Can work in both modes

### 3. Component Registration

Mini-apps can expose components for use in the orchestrated UI:

```python
from modular_architecture import modular_arch

# Register a component
def MyComponent(props):
    return {"type": "div", "content": f"Hello {props['name']}"}

modular_arch.register_component("MyComponent", MyComponent)
```

### 4. API Endpoint Registration

Mini-apps can expose API endpoints:

```python
async def my_api_handler(context, data):
    tenant_id = context["tenant_id"]
    return {"message": f"Hello tenant {tenant_id}", "data": data}

modular_arch.register_api_endpoint("my_endpoint", my_api_handler)
```

## Usage Examples

### 1. Creating a Mini-App Instance

```python
# Create an instance of a mini-app
instance = modular_arch.create_app_instance(
    app_name="qi_rag_private",
    tenant_id="tenant-123",
    config={
        "openai_api_key": "sk-...",
        "max_tokens": 1000
    }
)
```

### 2. Getting UI Configuration for Orchestrated Mode

```python
# Get UI configuration for a tenant
ui_config = modular_arch.get_orchestrated_ui_config("tenant-123")

# This returns a list of components to render:
# [
#   {
#     "component": "ChatInterface",
#     "instance_id": "qi_rag_private_tenant-123_1234567890",
#     "app_name": "qi_rag_private",
#     "props": {
#       "tenant_id": "tenant-123",
#       "instance_id": "...",
#       "config": {...}
#     }
#   }
# ]
```

### 3. Executing API Calls

```python
# Execute an API call to a mini-app
result = await modular_arch.execute_api_call(
    endpoint="chat",
    tenant_id="tenant-123",
    data={"message": "Hello, world!"}
)
```

## API Endpoints

### List Available Apps
```http
GET /apps
Authorization: Bearer <token>
```

### Create App Instance
```http
POST /apps/{app_name}/instances
Authorization: Bearer <token>
Content-Type: application/json

{
  "config": {
    "api_key": "your-api-key"
  }
}
```

### List App Instances
```http
GET /apps/instances
Authorization: Bearer <token>
```

### Update App Config
```http
PUT /apps/instances/{instance_id}/config
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_setting": "value"
}
```

### Remove App Instance
```http
DELETE /apps/instances/{instance_id}
Authorization: Bearer <token>
```

### Get UI Configuration
```http
GET /apps/ui-config
Authorization: Bearer <token>
```

### Execute App API
```http
POST /apps/api/{endpoint}
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {...}
}
```

### Get Statistics
```http
GET /apps/statistics
Authorization: Bearer <token>
```

## Frontend Integration

### React Component Renderer

```jsx
import React, { useState, useEffect } from 'react';

const ComponentRenderer = ({ tenantId }) => {
  const [uiConfig, setUiConfig] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/apps/ui-config', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setUiConfig(data.ui_config);
      setLoading(false);
    });
  }, [tenantId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {uiConfig.map((item, index) => {
        const Component = componentRegistry[item.component];
        return (
          <Component
            key={index}
            {...item.props}
          />
        );
      })}
    </div>
  );
};

// Component registry
const componentRegistry = {
  ChatInterface: ChatInterfaceComponent,
  DocumentUploader: DocumentUploaderComponent,
  Visualization3D: Visualization3DComponent,
  // ... other components
};
```

### Dynamic Component Loading

```jsx
import React, { lazy, Suspense } from 'react';

const DynamicComponent = ({ componentName, ...props }) => {
  const Component = lazy(() => import(`./components/${componentName}`));
  
  return (
    <Suspense fallback={<div>Loading component...</div>}>
      <Component {...props} />
    </Suspense>
  );
};
```

## Deployment Strategies

### 1. Monorepo Deployment
All mini-apps are deployed together as part of the main application.

**Pros:**
- Simple deployment
- Shared dependencies
- Easy debugging

**Cons:**
- Less flexibility
- All apps must be compatible

### 2. Independent Deployment
Each mini-app is deployed separately.

**Pros:**
- Maximum flexibility
- Independent versioning
- Isolated failures

**Cons:**
- More complex deployment
- Potential version conflicts

### 3. Hybrid Deployment
Some apps are deployed together, others independently.

**Pros:**
- Balanced flexibility and simplicity
- Can optimize based on app characteristics

**Cons:**
- More complex management

## Best Practices

### 1. App Design
- Design apps to be stateless when possible
- Use configuration for environment-specific settings
- Implement proper error handling and logging

### 2. Component Design
- Make components reusable and configurable
- Use props for configuration
- Implement proper loading and error states

### 3. API Design
- Use consistent naming conventions
- Implement proper authentication and authorization
- Return consistent response formats

### 4. Configuration Management
- Use environment variables for sensitive data
- Validate configuration on startup
- Provide sensible defaults

### 5. Testing
- Test apps in both orchestrated and independent modes
- Mock dependencies for isolated testing
- Test component integration

## Security Considerations

### 1. Tenant Isolation
- Always validate tenant access
- Use proper authentication and authorization
- Isolate data between tenants

### 2. API Security
- Validate all inputs
- Implement rate limiting
- Use HTTPS for all communications

### 3. Configuration Security
- Never expose sensitive configuration
- Use secure storage for secrets
- Rotate keys regularly

## Monitoring and Observability

### 1. Logging
- Use structured logging
- Include tenant context in logs
- Log important events and errors

### 2. Metrics
- Track app usage and performance
- Monitor error rates
- Track resource usage

### 3. Health Checks
- Implement health check endpoints
- Monitor app availability
- Alert on failures

## Example Mini-App Implementation

Here's a complete example of a mini-app:

```python
# my_app/app.py
from fastapi import FastAPI
from modular_architecture import modular_arch

app = FastAPI()

# Register components
def MyWidget(props):
    return {
        "type": "div",
        "className": "my-widget",
        "children": [
            {"type": "h2", "children": props.get("title", "My Widget")},
            {"type": "p", "children": props.get("content", "Default content")}
        ]
    }

modular_arch.register_component("MyWidget", MyWidget)

# Register API endpoints
async def my_api_handler(context, data):
    tenant_id = context["tenant_id"]
    return {
        "status": "success",
        "tenant_id": tenant_id,
        "data": data
    }

modular_arch.register_api_endpoint("my_api", my_api_handler)

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

```json
# my_app/manifest.json
{
  "name": "my_app",
  "version": "1.0.0",
  "description": "Example mini-app",
  "mode": "hybrid",
  "entry_point": "app.py",
  "dependencies": ["fastapi", "uvicorn"],
  "exposed_components": ["MyWidget"],
  "api_endpoints": ["my_api"],
  "config_schema": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "default": "My Widget"
      }
    }
  },
  "permissions": ["read_data"],
  "metadata": {
    "category": "ui",
    "tags": ["widget", "example"]
  }
}
```

This modular architecture provides the flexibility to build complex applications while maintaining simplicity and reusability.
