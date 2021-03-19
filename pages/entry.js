import React from "react";
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import axios from "axios";
import AppLayout from "../components/layout";
import Registration from "../components/registration";
import Login from "../components/login";

const { Link, Title } = Typography

export default function entry() {
  const [showRegistration, setShowRegistration] = React.useState(false)
  const onClick = () => setShowRegistration(!showRegistration)
  return (
    <AppLayout>
    <section style={{textAlign:"center"}}>{ !showRegistration ? <Title>Login</Title> : <Title>Registration</Title> }</section>
    <section style={{padding: "0px 10vw 0px 10vw"}}>
    { !showRegistration ? <Login /> : null }
    { showRegistration ? <Registration /> : null }
    </section>
    <section style={{"textAlign":"center"}}>
    { !showRegistration ? <Link onClick={onClick}>Dont have an account? Click here to register</Link> : <Link onClick={onClick}>Back to Login</Link> }
      
    </section>
    </AppLayout>
  );
};
