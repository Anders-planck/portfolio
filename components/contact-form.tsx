"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Mail, MessageSquare } from "lucide-react";
import { sendEmail, isEmailJSConfigured } from "@/lib/emailjs";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface ContactFormProps {
  compact?: boolean;
  showHeader?: boolean;
  title?: string;
  description?: string;
}

export default function ContactForm({
  compact = false,
  showHeader = false,
  title,
  description
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Check if EmailJS is properly configured
      if (!isEmailJSConfigured()) {
        toast.error("Configuration Error", {
          description: "Email service is not configured. Please contact the administrator.",
        });
        setIsSubmitting(false);
        return;
      }

      // Send email using EmailJS
      const result = await sendEmail({
        name: data.name,
        email: data.email,
        subject: "Portfolio Contact",
        message: data.message,
      });

      if (result.success) {
        toast.success("Message sent!", {
          description: "Thanks for reaching out! I'll get back to you soon.",
        });
        reset();
      } else {
        toast.error("Error", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {showHeader && (
        <div className="space-y-2 mb-6">
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className={showHeader ? "" : "pt-6"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                className="h-12 text-base pl-10"
                aria-invalid={!!errors.name}
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className="h-12 text-base pl-10"
                aria-invalid={!!errors.email}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Textarea
                id="message"
                placeholder="Tell me about your project, opportunity, or inquiry..."
                rows={compact ? 5 : 6}
                className="text-base min-h-[140px] pl-10 pt-3"
                aria-invalid={!!errors.message}
                {...register("message", {
                  required: "Message is required",
                  minLength: {
                    value: 10,
                    message: "Message must be at least 10 characters",
                  },
                })}
              />
            </div>
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-semibold">
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            I typically respond within 24 hours
          </p>
        </form>
      </div>
    </div>
  );
}
