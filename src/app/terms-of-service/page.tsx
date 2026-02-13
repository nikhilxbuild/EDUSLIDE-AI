import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <div className="container mx-auto max-w-4xl px-4 pt-28 pb-12 md:pt-32 md:pb-20">
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="text-center text-4xl">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Last updated: July 25, 2024</p>

            <h3 className="font-semibold text-lg text-foreground">1. Acceptance of Terms</h3>
            <p>
              By accessing and using EduSlide ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
            </p>

            <h3 className="font-semibold text-lg text-foreground">2. Description of Service</h3>
            <p>
              EduSlide provides users with tools to process and reformat PDF documents for educational and personal use. All processing is performed locally in the user's browser, and no files are uploaded to our servers.
            </p>

            <h3 className="font-semibold text-lg text-foreground">3. User Conduct</h3>
            <p>
              You are solely responsible for the content you process through our Service. You agree not to use the Service to process any material that is unlawful, harmful, or infringes on the rights of others.
            </p>

            <h3 className="font-semibold text-lg text-foreground">4. No Warranty</h3>
            <p>
              The Service is provided "as is" without any warranties of any kind. We do not guarantee that the Service will be error-free or that it will meet your specific requirements.
            </p>

            <h3 className="font-semibold text-lg text-foreground">5. Limitation of Liability</h3>
            <p>
              In no event shall EduSlide be liable for any direct, indirect, incidental, or consequential damages arising out of the use or inability to use the Service.
            </p>
            
            <h3 className="font-semibold text-lg text-foreground">6. Changes to Terms</h3>
            <p>
              We reserve the right to modify these Terms at any time. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
            </p>

            <h3 className="font-semibold text-lg text-foreground">7. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at <a href="mailto:EduSlideAi.in@gmail.com" className="text-primary hover:underline">EduSlideAi.in@gmail.com</a>.
            </p>

          </CardContent>
        </Card>
      </div>
    </>
  );
}
