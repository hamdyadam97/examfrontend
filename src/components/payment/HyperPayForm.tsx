import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    wpwlOptions?: Record<string, unknown>;
    wpwl?: { unload?: () => void };
  }
}

interface Props {
  widgetUrl: string;
  brands: string;
  paymentId: string;
  /** Called once the card form has been drawn by HyperPay. */
  onReady?: () => void;
}

/**
 * HyperPay's COPYandPAY card form. The card details go straight to HyperPay; when the shopper
 * submits, HyperPay sends the browser to /payment/result, where our server verifies the payment.
 */
export function HyperPayForm({ widgetUrl, brands, paymentId, onReady }: Props) {
  const { i18n } = useTranslation();
  const resultUrl = `${window.location.origin}/payment/result?id=${encodeURIComponent(paymentId)}`;

  useEffect(() => {
    // A previous form (another checkout, or the modal opened twice) must be unloaded first.
    window.wpwl?.unload?.();
    document.querySelectorAll('script[data-hyperpay]').forEach((s) => s.remove());
    window.wpwlOptions = {
      locale: i18n.language === 'ar' ? 'ar' : 'en',
      style: 'card',
      onReady: () => onReady?.(),
    };
    const script = document.createElement('script');
    script.src = widgetUrl;
    script.async = true;
    script.dataset.hyperpay = '1';
    document.body.appendChild(script);
    return () => {
      window.wpwl?.unload?.();
      script.remove();
    };
    // onReady is a notification only; reloading the widget for it would reset the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetUrl, i18n.language]);

  return (
    <div className="hyperpay-form" dir="ltr">
      <form action={resultUrl} className="paymentWidgets" data-brands={brands} />
    </div>
  );
}
