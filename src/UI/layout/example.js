import React from "react";
import Layout from "./index";

import "./index.css";

export default () => {
  return (
    <>
      <h3>没有上下左右的间隔：(红色边框是最外边的容器边框)</h3>
      <div style={{ border: "1px solid red" }}>
        <Layout.Row>
          <Layout.Col span={24}>col1</Layout.Col>
        </Layout.Row>

        <Layout.Row>
          <Layout.Col span={12}>col1</Layout.Col>
          <Layout.Col span={12}>col2</Layout.Col>
        </Layout.Row>

        <Layout.Row>
          <Layout.Col span={8}>col1</Layout.Col>
          <Layout.Col span={8}>col2</Layout.Col>
          <Layout.Col span={8}>col3</Layout.Col>
        </Layout.Row>

        <Layout.Row>
          <Layout.Col span={6}>col1</Layout.Col>
          <Layout.Col span={6}>col2</Layout.Col>
          <Layout.Col span={6}>col2</Layout.Col>
          <Layout.Col span={6}>col3</Layout.Col>
        </Layout.Row>
      </div>
      <h3>
        设置上下左右的间隔：上下：8px；左右：10px (红色边框是最外边的容器边框)
      </h3>
      <div style={{ border: "1px solid red" }}>
        <Layout.Row gutter={20} marginTop={8} marginBottom={16}>
          <Layout.Col span={24}>col1</Layout.Col>
        </Layout.Row>

        <Layout.Row gutter={20}>
          <Layout.Col span={12}>col1</Layout.Col>
          <Layout.Col span={12}>
            <div>col2</div>
            <div>col2</div>
          </Layout.Col>
        </Layout.Row>

        <Layout.Row gutter={20} marginTop={16}>
          <Layout.Col span={8}>
            <div>col1</div>
            <div>col1</div>
            <div>col1</div>
          </Layout.Col>
          <Layout.Col span={8}>col2</Layout.Col>
          <Layout.Col span={8}>col3</Layout.Col>
        </Layout.Row>

        <Layout.Row gutter={20} marginTop={16} marginBottom={8}>
          <Layout.Col span={6}>col1</Layout.Col>
          <Layout.Col span={6}>col2</Layout.Col>
          <Layout.Col span={6}>col3</Layout.Col>
          <Layout.Col span={6}>
            <div>col4</div>
            <div>col4</div>
            <div>col4</div>
            <div>col4</div>
          </Layout.Col>
        </Layout.Row>

        <Layout.Row gutter={20} marginTop={16} marginBottom={8}>
          <Layout.Col span={12}>col1</Layout.Col>
          <Layout.Col span={6}>col2</Layout.Col>
          <Layout.Col span={6}>col3</Layout.Col>
        </Layout.Row>
      </div>
    </>
  );
};
