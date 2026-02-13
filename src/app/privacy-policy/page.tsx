import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 pt-8 pb-12 md:pt-12 md:pb-20">
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="text-center text-4xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Last updated: July 25, 2024</p>
            
            <h3 className="font-semibold text-lg text-foreground">1. Introduction</h3>
            <p>
              Welcome to EduSlide. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services. Your privacy is our top priority, and we do not store or upload your files to our servers.
            </p>

            <h3 className="font-semibold text-lg text-foreground">2. Information We Do Not Collect</h3>
            <p>
              We do not collect, store, or process any personal data from the documents you upload. All PDF processing is done locally in your browser. The files you upload never leave your computer.
            </p>

            <h3 className="font-semibold text-lg text-foreground">3. How Your Files Are Handled</h3>
            <p>
              When you upload a PDF to EduSlide, it is processed entirely within your web browser. The file is not transmitted to our servers or any third-party service. Once you close your browser tab or end your session, the file and any processed data are discarded from your browser's memory.
            </p>

            <h3 className="font-semibold text-lg text-foreground">4. Cookies and Analytics</h3>
            <p>
              We may use anonymous analytics tools to understand how our service is used and to improve user experience. This data is aggregated and does not contain any personal information. We do not use tracking cookies that identify you personally.
            </p>

            <h3 className="font-semibold text-lg text-foreground">5. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>

            <h3 className="font-semibold text-lg text-foreground">6. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:EduSlideAi.in@gmail.com" className="text-primary hover:underline">EduSlideAi.in@gmail.com</a>.
            </p>

          </CardContent>
        </Card>
      </div>
    </>
  );
}
