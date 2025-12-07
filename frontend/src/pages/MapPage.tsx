// frontend/src/pages/MapPage.tsx
import React from "react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";
import SvgMapViewer from "../components/SvgMapViewer";

export default function MapPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Map</h1>
        </div>

        <Card>
          <SvgMapViewer containerClassName="h-[640px]" />
        </Card>
      </div>
    </MainLayout>
  );
}
