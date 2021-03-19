import React from "react";
import { withRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import cookie from "js-cookie";
import { Layout, Menu } from "antd";
import {
  LoginOutlined,
  BookOutlined,
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";


import { getUser } from "../lib/api";

const { Header, Footer, Sider, Content } = Layout;

class AppLayout extends React.Component {
  state = {
    loggedIn: false,
    user: null,
  };

  componentDidMount() {
    this.loadUser();
  }

  async loadUser() {
    try {
      let response = await getUser();
      this.setState({ loggedIn: true, user: response.user });
    } catch (error) {
      console.log(error);
    }
  }

  logout = () => {
    cookie.remove("token");
    this.setState({
      loggedIn: false,
      user: null,
    });
    this.props.router.push("/entry")
  };

  render() {
    return (
      <Layout className="site-layout" style={{ minHeight: "100vh" }}>
        <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
          {this.state.loggedIn ? (
            <div className="greeting" style={{ float: "right" }}>
              Welcome {this.state.user.email}
            </div>
          ) : null}
          <Menu mode="horizontal" defaultSelectedKeys={["1"]}>
            <Menu.Item
              key="1"
              icon={<HomeOutlined />}
              onClick={() => this.props.router.push("/")}
            >
              Home
            </Menu.Item>
            <Menu.Item
              key="2"
              icon={<BookOutlined />}
              onClick={() => this.state.loggedIn ? this.props.router.push("/collection") : this.props.router.push("/entry")}
            >
              Collections
            </Menu.Item>
            {this.state.loggedIn ? (
              <Menu.Item
                key="4"
                icon={<LogoutOutlined />}
                onClick={this.logout}
              >
                Logout
              </Menu.Item>
            ) : (
              <Menu.Item
                key="3"
                icon={<LoginOutlined />}
                onClick={() => this.props.router.push("/entry")}
              >
                Login
              </Menu.Item>
            )}
          </Menu>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            padding: "100px 50px",
          }}
        >
          <Head>
            <title>Restaurellection</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          {this.props.children}
        </Content>
      </Layout>
    );
  }
}

export default withRouter(AppLayout);
