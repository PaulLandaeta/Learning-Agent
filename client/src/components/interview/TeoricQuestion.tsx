import React, { useState } from 'react';
import { Typography, Checkbox, Button, Flex } from 'antd';
import { RightOutlined, CheckOutlined } from '@ant-design/icons';
import type { CheckboxValueType } from 'antd';

const { Paragraph } = Typography;

export default function TeoricQuestion({ onNextQuestion }) {
  const [selectedValues, setSelectedValues] = useState([]);

  const handleCheckboxChange = (checkedValues) => {
    setSelectedValues(checkedValues);
  };
  
  const handleNextQuestionClick = () => {
    onNextQuestion();
  };

  const options = [
    { label: 'O(log n)', value: 'log n' },
    { label: 'O(n)', value: 'n' },
    { label: 'O(n log n)', value: 'n log n' },
    { label: 'O(n²)', value: 'n²' },
  ];

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: '#e6e6e6',
          maxWidth: '75%',
          marginBottom: '24px',
          alignSelf: 'flex-start',
        }}
      >
        <Paragraph style={{ margin: 0, fontWeight: 'bold' }}>
          ¿Cuál es la complejidad temporal de buscar un elemento en un array ordenado usando búsqueda binaria?
        </Paragraph>
      </div>
      
      <Flex vertical style={{ width: '100%' }} gap="small" align="center">
        <Checkbox.Group
          style={{
            width: '100%',
            flexDirection: 'column',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
          onChange={handleCheckboxChange}
          value={selectedValues}
        >
          {options.map((option) => (
            <Checkbox key={option.value} value={option.value} style={{ margin: 0 }}>
              <div
                style={{
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: `2px solid ${selectedValues.includes(option.value) ? '#1A2A80' : '#d9d9d9'}`,
                  backgroundColor: selectedValues.includes(option.value) ? '#e6f7ff' : '#fff',
                  width: '320px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: selectedValues.includes(option.value) ? '0 4px 12px rgba(26, 42, 128, 0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
                }}
              >
                <Paragraph style={{ margin: 0, fontWeight: 'bold' }}>
                  {option.label}
                </Paragraph>
                {selectedValues.includes(option.value) && (
                  <CheckOutlined style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#1A2A80', fontSize: '20px' }} />
                )}
              </div>
            </Checkbox>
          ))}
        </Checkbox.Group>
      </Flex>
      
      {selectedValues.length > 0 && (
        <div style={{ alignSelf: 'center', marginTop: '24px' }}>
          <Button
            type="primary"
            size="large"
            onClick={handleNextQuestionClick}
            style={{
              borderRadius: '25px',
              height: '48px',
              padding: '0 24px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              backgroundColor: '#1A2A80',
            }}
          >
            Siguiente Pregunta <RightOutlined />
          </Button>
        </div>
      )}
    </div>
  );
}