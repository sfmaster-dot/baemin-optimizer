// src/components/SectionIntro.jsx

import React, { useState } from 'react';

function SectionIntro({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      border: '1px solid rgba(251, 191, 36, 0.3)',
      borderRadius: '8px',
      background: 'rgba(251, 191, 36, 0.05)',
      marginBottom: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '14px 18px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fbbf24',
          fontWeight: 'bold',
          fontSize: '15px',
          userSelect: 'none'
        }}
      >
        <span>{title}</span>
        <span style={{
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          fontSize: '14px',
          display: 'inline-block'
        }}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div style={{
          padding: '0 18px 16px 18px',
          color: 'rgba(255, 255, 255, 0.85)',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.7',
          fontSize: '14px',
          animation: 'sectionIntroSlide 0.3s ease'
        }}>
          {content}
        </div>
      )}

      <style>{`
        @keyframes sectionIntroSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default SectionIntro;