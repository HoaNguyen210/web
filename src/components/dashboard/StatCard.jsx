import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, icon: Icon, color = "default" }) {
  const colorClasses = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={cn("p-3 rounded-lg", colorClasses[color] || colorClasses.default)}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
    </div>
  );
}

