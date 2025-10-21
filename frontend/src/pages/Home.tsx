import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // 자동으로 Protect/Reveal 페이지로 리다이렉트
  React.useEffect(() => {
    navigate('/protect-reveal');
  }, [navigate]);

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', textAlign: 'center' }}>
      <h2>로딩 중...</h2>
      <p>CRDP Protect/Reveal 페이지로 이동합니다.</p>
    </div>
  );
};

export default Home;
