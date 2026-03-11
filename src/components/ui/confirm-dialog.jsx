"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog({
  isOpen,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  variant = "destructive",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            
            {/* Text */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to show confirm dialog as a promise-based approach
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState(null);

  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      setIsOpen(true);
      setPendingAction({
        resolve,
        ...options,
      });
    });
  };

  const handleConfirm = () => {
    if (pendingAction?.resolve) {
      pendingAction.resolve(true);
    }
    setIsOpen(false);
    setPendingAction(null);
  };

  const handleCancel = () => {
    if (pendingAction?.resolve) {
      pendingAction.resolve(false);
    }
    setIsOpen(false);
    setPendingAction(null);
  };

  return {
    isOpen,
    confirm,
    ConfirmDialog: () => (
      <ConfirmDialog
        isOpen={isOpen}
        title={pendingAction?.title || "Xác nhận"}
        message={pendingAction?.message || "Bạn có chắc chắn muốn thực hiện hành động này?"}
        confirmText={pendingAction?.confirmText || "Xác nhận"}
        cancelText={pendingAction?.cancelText || "Hủy"}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        variant={pendingAction?.variant || "destructive"}
      />
    ),
  };
}

