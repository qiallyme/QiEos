import React from 'react';

export function makeIcon(IconComponent: React.ComponentType<any>) {
  return (props: React.SVGProps<SVGSVGElement>) => {
    return <IconComponent {...props} />;
  };
}
