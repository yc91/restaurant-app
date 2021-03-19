import React from "react";
import { useRouter } from "next/router";
import { Form, Input, Button, Checkbox, Alert } from "antd";
import axios from "axios";
import cookie from "js-cookie";

import AppLayout from "../components/layout";
import { register } from "../lib/api";

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

export default function Registration() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = React.useState("");


  const handleRegister = async(values) => {
    try{
      let token = await register(values);
      cookie.set("token", token, { expires: 2 });
      router.push("/");
    }catch(error){
      let errorResp = error.response.data;
      setErrorMessage(errorResp.message);
    }
  }

  return (
    <>
      <Form
        name="register"
        initialValues={{ remember: true }}
        onFinish={handleRegister}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please enter your email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          rules={[{ required: true, message: "Please confirm your password" }]}
        >
          <Input.Password />
        </Form.Item>

        {errorMessage ? (
          <Alert
            message="Error"
            description={errorMessage}
            type="error"
            showIcon
          />
        ) : null}
        <Form.Item style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
