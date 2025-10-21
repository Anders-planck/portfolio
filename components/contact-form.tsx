"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Mail, FileText, MessageSquare, Building2, Briefcase, Phone, Linkedin } from "lucide-react";
import { sendEmail, isEmailJSConfigured } from "@/lib/emailjs";

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  role?: string;
  subject: string;
  customSubject?: string;
  budgetRange?: string;
  timeline?: string;
  projectType?: string;
  phone?: string;
  linkedin?: string;
  preferredContact?: string;
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
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [showCustomSubject, setShowCustomSubject] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>();

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    setValue("subject", value);
    setShowCustomSubject(value === "custom");
    setShowProjectDetails(value === "freelance" || value === "consulting");
  };

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
        subject: data.subject,
        message: data.message,
        company: data.company,
        role: data.role,
        customSubject: data.customSubject,
        budgetRange: data.budgetRange,
        timeline: data.timeline,
        projectType: data.projectType,
        phone: data.phone,
        linkedin: data.linkedin,
        preferredContact: data.preferredContact,
      });

      if (result.success) {
        toast.success("Message sent!", {
          description: result.message,
        });
        reset();
        setSelectedSubject("");
        setShowCustomSubject(false);
        setShowProjectDetails(false);
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
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company / Organization</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your company (optional)"
                    className="h-12 text-base pl-10"
                    {...register("company")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="role"
                    type="text"
                    placeholder="e.g., CTO, Recruiter, Developer (optional)"
                    className="h-12 text-base pl-10"
                    {...register("role")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">
                What is this regarding? <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job">Job Opportunity</SelectItem>
                  <SelectItem value="freelance">Freelance Project</SelectItem>
                  <SelectItem value="consulting">Consulting / Advisory</SelectItem>
                  <SelectItem value="collaboration">Collaboration Proposal</SelectItem>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="custom">Other (Custom Subject)</SelectItem>
                </SelectContent>
              </Select>
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            {showCustomSubject && (
              <div className="space-y-2">
                <Label htmlFor="customSubject">
                  Custom Subject <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="customSubject"
                    type="text"
                    placeholder="Please specify..."
                    className="h-12 text-base pl-10"
                    aria-invalid={!!errors.customSubject}
                    {...register("customSubject", {
                      required: showCustomSubject ? "Custom subject is required" : false,
                      minLength: {
                        value: 3,
                        message: "Subject must be at least 3 characters",
                      },
                    })}
                  />
                </div>
                {errors.customSubject && (
                  <p className="text-sm text-destructive">{errors.customSubject.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Project Details (conditional) */}
          {showProjectDetails && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Project Details</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budgetRange">Budget Range</Label>
                  <Select onValueChange={(value) => setValue("budgetRange", value)}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select budget range (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-5k">Under $5,000</SelectItem>
                      <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                      <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                      <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                      <SelectItem value="50k-plus">$50,000+</SelectItem>
                      <SelectItem value="not-sure">Not Sure Yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Project Timeline</Label>
                  <Select onValueChange={(value) => setValue("timeline", value)}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select timeline (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP</SelectItem>
                      <SelectItem value="1-3-months">1-3 Months</SelectItem>
                      <SelectItem value="3-6-months">3-6 Months</SelectItem>
                      <SelectItem value="6-plus-months">6+ Months</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select onValueChange={(value) => setValue("projectType", value)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select project type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-app">Web Application</SelectItem>
                    <SelectItem value="mobile-app">Mobile App</SelectItem>
                    <SelectItem value="api">API Development</SelectItem>
                    <SelectItem value="fullstack">Full-Stack Project</SelectItem>
                    <SelectItem value="frontend">Frontend Development</SelectItem>
                    <SelectItem value="backend">Backend Development</SelectItem>
                    <SelectItem value="devops">DevOps / Infrastructure</SelectItem>
                    <SelectItem value="consulting">Technical Consulting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Additional Contact Info */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000 (optional)"
                    className="h-12 text-base pl-10"
                    {...register("phone")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="linkedin.com/in/yourprofile (optional)"
                    className="h-12 text-base pl-10"
                    {...register("linkedin")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContact">Preferred Contact Method</Label>
              <Select onValueChange={(value) => setValue("preferredContact", value)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="How would you like to be contacted? (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="linkedin">LinkedIn Message</SelectItem>
                  <SelectItem value="any">Any Method</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Textarea
                id="message"
                placeholder="Tell me more about your project, opportunity, or inquiry..."
                rows={compact ? 4 : 6}
                className="text-base min-h-[120px] pl-10"
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

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base">
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
