<<<<<<< HEAD

import { Card, Typography, Button } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function interview() {
  return (
    <div style={{ padding: 24 }}>
      <Card style={{ borderRadius: 12, maxWidth: 800, margin: "0 auto" }}>
        <Title level={3}>Entrevista</Title>
        <Text>Próximamente: simulaciones y tips para entrevistas técnicas y académicas.</Text>

        <div style={{ marginTop: 24 }}>
          <Link to="/reinforcement">
            <Button>Volver</Button>
          </Link>
        </div>
      </Card>
=======
import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Modal, Row, Col } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import OpenQuestion from '../../components/interview/OpenQuestion';
import TeoricQuestion from '../../components/interview/TeoricQuestion';
import MultipleQuestion from '../../components/interview/MultipleQuestion';

const { Title } = Typography;

const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export default function InterviewChat() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [questionOrder, setQuestionOrder] = useState([]);

  useEffect(() => {
    const questions = ['open', 'teoric', 'multiple', 'open'];
    setQuestionOrder(shuffleArray(questions));
  }, []);

  const handleFinishClick = () => {
    setIsModalOpen(true);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionOrder.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setIsModalOpen(true);
    }
  };

  const currentQuestionType = questionOrder[currentQuestionIndex];

  const renderQuestionComponent = () => {
    switch (currentQuestionType) {
      case 'open':
        return <OpenQuestion key={currentQuestionIndex} onNextQuestion={handleNextQuestion} />;
      case 'teoric':
        return <TeoricQuestion key={currentQuestionIndex} onNextQuestion={handleNextQuestion} />;
      case 'multiple':
        return <MultipleQuestion key={currentQuestionIndex} onNextQuestion={handleNextQuestion} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f7fa',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '100%',
          maxHeight: '800px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
        }}
        bodyStyle={{ flex: 1, overflowY: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #e8e8e8' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0, color: '#1A2A80' }}>
                Entrevista
              </Title>
            </Col>
            <Col>
              <Button
                icon={<CloseOutlined />}
                onClick={handleFinishClick}
                type="text"
                style={{
                  color: '#fff',
                  backgroundColor: '#1A2A80',
                  borderRadius: '8px',
                  height: '36px',
                  fontWeight: '500',
                  padding: '0 16px',
                }}
              >
                Finalizar
              </Button>
            </Col>
          </Row>
        </div>
        
        {renderQuestionComponent()}

      </Card>

      <Modal
        title="Finalizar Entrevista"
        open={isModalOpen}
        onOk={() => {
          setIsModalOpen(false);
          navigate('/reinforcement');
        }}
        onCancel={() => setIsModalOpen(false)}
        okText="Sí, finalizar"
        cancelText="No, continuar"
      >
        <p>¿Estás seguro de que quieres finalizar la entrevista?</p>
        <p>Perderás el progreso actual.</p>
      </Modal>
>>>>>>> 2cd0b20 (Base de Capas Entrevistas)
    </div>
  );
}
