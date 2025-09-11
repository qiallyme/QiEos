import React from 'react';
import { MainLayout } from '../../../components/admin/layout/MainLayout';
import { Card, Button } from '@qieos/ui';
import { FiPlus } from 'react-icons/fi';

export const TenantsPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="Tenants">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tenants</h2>
          <Button>
            <FiPlus className="mr-2" /> New Tenant
          </Button>
        </div>
        <p>Tenant management coming soon.</p>
      </Card>
    </MainLayout>
  );
}
