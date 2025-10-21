import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
};

// Initialize EmailJS with rate limiting and security settings
if (typeof window !== 'undefined' && EMAILJS_CONFIG.publicKey) {
  emailjs.init({
    publicKey: EMAILJS_CONFIG.publicKey,
    blockHeadless: true,
    limitRate: {
      throttle: 10000, // 10 seconds between requests
    },
  });
}

export interface EmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
  role?: string;
  customSubject?: string;
  budgetRange?: string;
  timeline?: string;
  projectType?: string;
  phone?: string;
  linkedin?: string;
  preferredContact?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  status?: number;
}

/**
 * Send an email using EmailJS
 * @param params - Email parameters containing name, email, subject, and message
 * @returns Promise with success status and message
 */
export async function sendEmail(params: EmailParams): Promise<EmailResponse> {
  // Validate environment variables
  if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
    console.error('EmailJS configuration is missing. Please check your environment variables.');
    return {
      success: false,
      message: 'Email service is not properly configured. Please contact the administrator.',
    };
  }

  // Validate input parameters
  if (!params.name || !params.email || !params.subject || !params.message) {
    return {
      success: false,
      message: 'All fields are required.',
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(params.email)) {
    return {
      success: false,
      message: 'Please provide a valid email address.',
    };
  }

  try {
    // Map subject codes to readable names
    const subjectMap: Record<string, string> = {
      'job': 'Job Opportunity',
      'freelance': 'Freelance Project',
      'consulting': 'Consulting / Advisory',
      'collaboration': 'Collaboration Proposal',
      'general': 'General Inquiry',
      'custom': params.customSubject || 'Other',
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        from_name: params.name,
        from_email: params.email,
        subject: subjectMap[params.subject] || params.subject,
        message: params.message,
        company: params.company || '',
        role: params.role || '',
        customSubject: params.customSubject || '',
        budgetRange: params.budgetRange || '',
        timeline: params.timeline || '',
        projectType: params.projectType || '',
        phone: params.phone || '',
        linkedin: params.linkedin || '',
        preferredContact: params.preferredContact || '',
        to_name: 'Anders Planck', // Change this to your name
      },
      {
        publicKey: EMAILJS_CONFIG.publicKey,
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        message: 'Message sent successfully! I will get back to you within 24 hours.',
        status: response.status,
      };
    }

    return {
      success: false,
      message: 'Failed to send message. Please try again later.',
      status: response.status,
    };
  } catch (error) {
    console.error('EmailJS error:', error);

    // Handle specific EmailJS errors
    if (error instanceof EmailJSResponseStatus) {
      // Rate limit error
      if (error.status === 429) {
        return {
          success: false,
          message: 'Too many requests. Please wait a moment before trying again.',
          status: error.status,
        };
      }

      // Blocked request
      if (error.status === 403) {
        return {
          success: false,
          message: 'Request blocked. Please try again later.',
          status: error.status,
        };
      }

      // Headless browser blocked
      if (error.status === 451) {
        return {
          success: false,
          message: 'Request blocked for security reasons.',
          status: error.status,
        };
      }

      return {
        success: false,
        message: `Failed to send message: ${error.text || 'Unknown error'}`,
        status: error.status,
      };
    }

    // Generic error
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

/**
 * Validate EmailJS configuration
 * @returns true if configuration is valid
 */
export function isEmailJSConfigured(): boolean {
  return !!(
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.templateId &&
    EMAILJS_CONFIG.publicKey
  );
}
