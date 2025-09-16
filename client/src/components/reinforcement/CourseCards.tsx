import React from "react";
import { Row, Col, Typography } from "antd";
import { Link, useParams } from "react-router-dom";
import { BookOutlined } from "@ant-design/icons";
import { CustomCard } from "../../components/shared/CustomCard";

interface Course {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface CourseCardsProps {
  courses: Course[];
  gutter?: [number, number];
  cardMaxWidth?: number | string;
  cardPadding?: number | string;
  titleFontSize?: string | number;
  titleFontWeight?: number;
  descriptionFontSize?: string | number;
}


export const CourseCards: React.FC<CourseCardsProps> = ({
  courses,
  gutter = [24, 24],
  cardMaxWidth = 450,
  cardPadding = 24,
  titleFontSize = "1.25rem",
  titleFontWeight = 500,
  descriptionFontSize = "0.95rem",
}) => (
  <Row gutter={gutter} justify="center" className="mt-4">
    {courses.map((course) => (
      <Col xs={24} md={12} key={course.id}>
        <Link to={`/${course.id}`} className="no-underline">

          <CustomCard
            style={{
              maxWidth: cardMaxWidth,
              width: "100%",
              height: "100%",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: cardPadding,
            }}
            className="animate-fade-in hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ease-in-out"
          >
            <CustomCard.Header
              icon={course.icon || <BookOutlined />}
              title={
                <Typography.Text style={{ fontSize: titleFontSize, fontWeight: titleFontWeight }}>
                  {course.title}
                </Typography.Text>
              }
            />
            <CustomCard.Description>
              <Typography.Text type="secondary" style={{ fontSize: descriptionFontSize }}>
                {course.description}
              </Typography.Text>
            </CustomCard.Description>
          </CustomCard>
        </Link>
      </Col>
    ))}
    </Row>
  );
};
