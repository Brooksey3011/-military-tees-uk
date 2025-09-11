// Professional Email Template Base - Military Tees UK
// Inspired by premium military brands like ThruDark and Forceswear

export interface EmailBrandingConfig {
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
  fontFamily: string
}

export const MILITARY_TEES_BRANDING: EmailBrandingConfig = {
  logoUrl: 'https://militarytees.co.uk/logowhite.png', // Your uploaded logo
  primaryColor: '#6b7c3a', // Updated military olive from accessibility fix
  secondaryColor: '#2d3e1a',
  accentColor: '#c19a6b', // Military sand
  textColor: '#1a1a1a',
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif"
}

export function createProfessionalEmailBase(content: string, branding = MILITARY_TEES_BRANDING): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Military Tees UK</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style type="text/css">
        /* Reset and Base Styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        
        /* Remove blue links for iOS */
        .appleLinksGrey a { color: #68a33f !important; text-decoration: none !important; }
        
        /* Main email styles */
        body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #f8f9fa !important;
          font-family: ${branding.fontFamily} !important;
          font-size: 16px;
          line-height: 1.6;
          color: ${branding.textColor};
        }
        
        /* Container */
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: ${branding.backgroundColor};
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        /* Header */
        .email-header {
          background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%);
          padding: 30px 40px;
          text-align: center;
          border-bottom: 3px solid ${branding.accentColor};
        }
        
        .logo {
          max-width: 180px;
          height: auto;
          margin-bottom: 15px;
        }
        
        .header-title {
          color: white;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .header-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 500;
          margin: 5px 0 0 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        /* Content Area */
        .email-content {
          padding: 40px;
          background-color: ${branding.backgroundColor};
        }
        
        /* Typography */
        h1, h2, h3 {
          color: ${branding.primaryColor};
          font-weight: 700;
          margin-top: 0;
        }
        
        h1 { font-size: 28px; line-height: 1.2; margin-bottom: 20px; }
        h2 { font-size: 22px; line-height: 1.3; margin-bottom: 16px; }
        h3 { font-size: 18px; line-height: 1.4; margin-bottom: 12px; }
        
        p {
          margin: 0 0 16px 0;
          font-size: 16px;
          line-height: 1.6;
        }
        
        /* Buttons */
        .btn-primary {
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%);
          color: white !important;
          text-decoration: none !important;
          border-radius: 0;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .btn-secondary {
          display: inline-block;
          padding: 14px 28px;
          background: transparent;
          color: ${branding.primaryColor} !important;
          text-decoration: none !important;
          border: 2px solid ${branding.primaryColor};
          border-radius: 0;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Cards and Containers */
        .info-box {
          background-color: #f8f9fa;
          border-left: 4px solid ${branding.primaryColor};
          padding: 20px;
          margin: 20px 0;
        }
        
        .highlight-box {
          background: linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.accentColor}15 100%);
          border: 1px solid ${branding.primaryColor}30;
          padding: 24px;
          margin: 24px 0;
          border-radius: 0;
        }
        
        /* Order/Product Items */
        .item-row {
          border-bottom: 1px solid #e9ecef;
          padding: 16px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .item-row:last-child {
          border-bottom: none;
        }
        
        .item-details {
          flex: 1;
        }
        
        .item-name {
          font-weight: 600;
          color: ${branding.textColor};
          font-size: 16px;
          margin-bottom: 4px;
        }
        
        .item-variant {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .item-quantity {
          color: #6c757d;
          font-size: 14px;
        }
        
        .item-price {
          font-weight: 700;
          color: ${branding.primaryColor};
          font-size: 16px;
        }
        
        /* Totals */
        .totals-section {
          background-color: #f8f9fa;
          padding: 24px;
          margin: 24px 0;
          border: 1px solid #e9ecef;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 15px;
        }
        
        .total-row.final {
          border-top: 2px solid ${branding.primaryColor};
          margin-top: 12px;
          padding-top: 12px;
          font-weight: 700;
          font-size: 18px;
          color: ${branding.primaryColor};
        }
        
        /* Address */
        .address-box {
          background-color: #f8f9fa;
          padding: 20px;
          margin: 16px 0;
          border: 1px solid #e9ecef;
          font-style: normal;
          line-height: 1.5;
        }
        
        /* Footer */
        .email-footer {
          background-color: ${branding.primaryColor};
          color: white;
          padding: 30px 40px;
          text-align: center;
        }
        
        .footer-logo {
          max-width: 120px;
          height: auto;
          margin-bottom: 16px;
          opacity: 0.9;
        }
        
        .footer-text {
          font-size: 14px;
          line-height: 1.5;
          margin: 8px 0;
          opacity: 0.9;
        }
        
        .footer-links {
          margin: 16px 0;
        }
        
        .footer-links a {
          color: white !important;
          text-decoration: none !important;
          font-size: 13px;
          margin: 0 12px;
          opacity: 0.8;
        }
        
        .social-links {
          margin: 20px 0 10px 0;
        }
        
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          opacity: 0.8;
        }
        
        /* Responsive */
        @media screen and (max-width: 480px) {
          .email-container {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .email-header, .email-content, .email-footer {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          
          .header-title {
            font-size: 20px !important;
          }
          
          h1 { font-size: 24px !important; }
          h2 { font-size: 20px !important; }
          
          .btn-primary, .btn-secondary {
            display: block !important;
            width: 100% !important;
            text-align: center !important;
            margin: 10px 0 !important;
          }
          
          .item-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .item-details {
            margin-bottom: 8px !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="email-header">
          <img src="${branding.logoUrl}" alt="Military Tees UK" class="logo">
          <h1 class="header-title">Military Tees UK</h1>
          <p class="header-subtitle">Proudly Serving Those Who Serve</p>
        </div>
        
        <!-- Content -->
        <div class="email-content">
          ${content}
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
          <img src="${branding.logoUrl}" alt="Military Tees UK" class="footer-logo">
          <p class="footer-text"><strong>Military Tees UK</strong></p>
          <p class="footer-text">Premium Military-Themed Apparel</p>
          <p class="footer-text">📧 info@militarytees.co.uk | 🌐 militarytees.co.uk</p>
          
          <div class="footer-links">
            <a href="https://militarytees.co.uk/track-order">Track Order</a>
            <a href="https://militarytees.co.uk/returns">Returns</a>
            <a href="https://militarytees.co.uk/contact">Contact</a>
            <a href="https://militarytees.co.uk/faq">FAQ</a>
          </div>
          
          <p class="footer-text" style="font-size: 12px; margin-top: 20px; opacity: 0.7;">
            © 2025 Military Tees UK. All rights reserved.<br>
            Honoring Military Heritage with Pride
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createPlainTextVersion(htmlContent: string): string {
  // Convert HTML to plain text for email clients that don't support HTML
  return htmlContent
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()
}