
"use client";

import { MainLayout } from "@/components/main-layout";
import { PageHeader } from "@/components/page-header";
import { CalendarView } from "@/components/calendar-view";

export default function CalendarPage() {
  return (
    <MainLayout>
      <PageHeader title="Calendar View" />
      <div className="p-4 md:p-6">
        <CalendarView />
      </div>
    </MainLayout>
  );
}
