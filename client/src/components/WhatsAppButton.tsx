export default function WhatsAppButton() {
  const phoneNumber = "923024379999";
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="whatsapp-float-btn"
    >
      {/* Pulse ring animation */}
      <span className="whatsapp-pulse" />

      {/* WhatsApp SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="34"
        height="34"
        fill="white"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.029c0 2.125.553 4.197 1.597 6.06L0 24l6.102-1.6c1.805.984 3.834 1.496 5.86 1.496h.005c6.636 0 12.032-5.391 12.035-12.028a11.88 11.88 0 00-3.535-8.498" />
      </svg>

      {/* Tooltip */}
      <span className="whatsapp-tooltip">Chat with us!</span>

      <style>{`
        .whatsapp-float-btn {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 9999;
          width: 62px;
          height: 62px;
          background: linear-gradient(135deg, #25D366 0%, #075E54 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(37, 211, 102, 0.35), 
                      inset 0 1px 1px rgba(255, 255, 255, 0.4),
                      inset 0 -2px 4px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .whatsapp-float-btn:hover {
          transform: translateY(-5px) scale(1.08);
          box-shadow: 0 12px 40px rgba(37, 211, 102, 0.45), 
                      inset 0 1px 1px rgba(255, 255, 255, 0.5),
                      inset 0 -2px 4px rgba(0, 0, 0, 0.1);
        }
        .whatsapp-float-btn:hover .whatsapp-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(-12px);
        }
        .whatsapp-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.4);
          animation: whatsapp-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          z-index: -1;
        }
        @keyframes whatsapp-ping {
          0% { transform: scale(1); opacity: 0.8; }
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
        .whatsapp-tooltip {
          position: absolute;
          right: calc(100% + 16px);
          top: 50%;
          transform: translateY(-50%) translateX(0px);
          background: #25D366;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          padding: 8px 16px;
          border-radius: 12px;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        .whatsapp-tooltip::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-left-color: #25D366;
        }
      `}</style>
    </a>
  );
}
