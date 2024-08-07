import React from 'react';
import { Link } from 'react-router-dom';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import HelpIcon from '@mui/icons-material/Help';
import PaymentsIcon from '@mui/icons-material/Payments';
import PolicyIcon from '@mui/icons-material/Policy';

const InfoPage = () => {
  const cards = [
    { title: 'Contact Info', icon: <ContactPhoneIcon style={{ fontSize: 80, fill: 'white' }} />, link: '/c/contact_info' },
    { title: 'Help Info', icon: <HelpIcon style={{ fontSize: 80, fill: 'white' }} />, link: '/c/help' },
    { title: 'Payment Channels', icon: <PaymentsIcon style={{ fontSize: 80, fill: 'white' }} />, link: '/c/payment_procedures' },
    { title: 'Privacy Policy', icon: <PolicyIcon style={{ fontSize: 80, fill: 'white' }} />, link: '/c/privacy_policy' },
  ];

  const handleCardClick = (link: string) => {
    window.location.href = link;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', width: '80vw', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxHeight: '100%', maxWidth: '100%', paddingTop: '20px', paddingLeft: '100px', paddingRight: '10px', color: 'white'}}>
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              textAlign: 'center',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '300px',
              minWidth: '0',
              backgroundColor: '#A62D38'
            }}
            onClick={() => handleCardClick(card.link)}
          >
            {card.icon}
            <h2>{card.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoPage;
