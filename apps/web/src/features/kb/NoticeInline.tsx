import React from "react";
import { AlertTriangle, Info, Shield, FileText } from "lucide-react";

interface NoticeInlineProps {
  type?: "warning" | "info" | "compliance" | "legal";
  children: React.ReactNode;
  className?: string;
}

const noticeConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    textColor: "text-yellow-800 dark:text-yellow-200",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-800 dark:text-blue-200",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  compliance: {
    icon: Shield,
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-800 dark:text-red-200",
    iconColor: "text-red-600 dark:text-red-400",
  },
  legal: {
    icon: FileText,
    bgColor: "bg-gray-50 dark:bg-gray-800",
    borderColor: "border-gray-200 dark:border-gray-700",
    textColor: "text-gray-800 dark:text-gray-200",
    iconColor: "text-gray-600 dark:text-gray-400",
  },
};

export const NoticeInline: React.FC<NoticeInlineProps> = ({
  type = "info",
  children,
  className = "",
}) => {
  const config = noticeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`
      ${config.bgColor} ${config.borderColor} ${config.textColor}
      border rounded-lg p-4 my-4
      ${className}
    `}
    >
      <div className="flex items-start">
        <Icon
          className={`h-5 w-5 ${config.iconColor} mt-0.5 mr-3 flex-shrink-0`}
        />
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

// Pre-configured compliance notices
export const Circular230Notice: React.FC<{ className?: string }> = ({
  className,
}) => (
  <NoticeInline type="compliance" className={className}>
    <strong>Circular 230 Disclosure:</strong> Any U.S. federal tax advice
    contained herein is not intended to be used, and cannot be used, for the
    purpose of avoiding penalties under the Internal Revenue Code or promoting,
    marketing, or recommending to another party any transaction or matter
    addressed herein.
  </NoticeInline>
);

export const ConfidentialityNotice: React.FC<{ className?: string }> = ({
  className,
}) => (
  <NoticeInline type="legal" className={className}>
    <strong>Confidentiality Notice:</strong> This document contains confidential
    and proprietary information. It is intended solely for the use of the
    individual or entity to whom it is addressed. Any unauthorized disclosure,
    distribution, or copying is strictly prohibited.
  </NoticeInline>
);

export const ProfessionalDisclaimer: React.FC<{ className?: string }> = ({
  className,
}) => (
  <NoticeInline type="info" className={className}>
    <strong>Professional Disclaimer:</strong> The information provided is for
    general informational purposes only and does not constitute professional
    advice. Please consult with a qualified professional for advice specific to
    your situation.
  </NoticeInline>
);

export const EngagementNotice: React.FC<{ className?: string }> = ({
  className,
}) => (
  <NoticeInline type="warning" className={className}>
    <strong>Engagement Notice:</strong> This document outlines the terms of our
    professional engagement. Please review carefully and contact us with any
    questions before proceeding.
  </NoticeInline>
);
