import React, { useState } from 'react';
import { Typography, Checkbox, Button, Card, Flex } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import type { CheckboxValueType } from 'antd/lib/checkbox/Group';

const { Paragraph } = Typography;

export default function MultipleQuestion({ onNextQuestion }) {
  const [selectedValues, setSelectedValues] = useState<CheckboxValueType[]>([]);

  const handleCheckboxChange = (checkedValues) => {
    setSelectedValues(checkedValues);
  };
  
  const handleNextQuestionClick = () => {
    onNextQuestion();
  };

  const codeSnippet1 = `// Bubble Sort
function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`;

  const codeSnippet2 = `// Quick Sort
function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  let pivot = arr[0];
  let left = [];
  let right = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}`;

  return (
    <div
      style={{
        flex: 1,
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: '#e6e6e6',
          maxWidth: '75%',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        <Paragraph style={{ margin: 0, fontWeight: 'bold' }}>
          ¿Cuál de los siguientes fragmentos de código tiene una mejor complejidad temporal promedio para ordenar una lista grande de elementos?
        </Paragraph>
      </div>

      <Checkbox.Group
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
        onChange={handleCheckboxChange}
        value={selectedValues}
      >
        <Flex gap="large" wrap="wrap" justify="center" style={{ width: '100%' }}>
          <Checkbox value="Opción A" style={{ margin: 0, padding: 0 }}>
            <Card
              title="Opción A"
              style={{ width: '400px', boxShadow: selectedValues.includes('Opción A') ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 2px 5px rgba(0,0,0,0.1)' }}
              bodyStyle={{ padding: 0 }}
            >
              <pre style={{ margin: 0, backgroundColor: '#f5f7fa', padding: '16px', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                <code style={{ fontSize: '13px', lineHeight: '1.4' }}>{codeSnippet1}</code>
              </pre>
            </Card>
          </Checkbox>
          <Checkbox value="Opción B" style={{ margin: 0, padding: 0 }}>
            <Card
              title="Opción B"
              style={{ width: '400px', boxShadow: selectedValues.includes('Opción B') ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 2px 5px rgba(0,0,0,0.1)' }}
              bodyStyle={{ padding: 0 }}
            >
              <pre style={{ margin: 0, backgroundColor: '#f5f7fa', padding: '16px', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                <code style={{ fontSize: '13px', lineHeight: '1.4' }}>{codeSnippet2}</code>
              </pre>
            </Card>
          </Checkbox>
        </Flex>
      </Checkbox.Group>

      {selectedValues.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
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
            }}
          >
            Siguiente Pregunta <RightOutlined />
          </Button>
        </div>
      )}
    </div>
  );
}