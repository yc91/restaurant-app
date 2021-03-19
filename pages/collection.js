import React from "react";
import Link from "next/link";
import { withRouter } from "next/router";
import { List, Button, Form, Input, Typography } from "antd";
import axios from "axios";

import AppLayout from "../components/layout";
import {
  getUser,
  getCollections,
  createCollection,
  removeCollection,
  updateCollectionName,
} from "../lib/api";

const { Paragraph } = Typography;

class Collections extends React.Component {
  state = {
    loggedIn: false,
    user: null,
    loading: false,
    list: [],
  };

  formRef = React.createRef();

  componentDidMount() {
    this.loadUser();
  }

  async loadUser() {
    try {
      let response = await getUser();
      this.setState({ loggedIn: true, user: response.user });
      this.loadCollections();
    } catch (error) {
      this.props.router.push("/entry");
    }
  }

  async loadCollections() {
    try {
      let response = await getCollections(this.state.user.id);
      this.setState({ list: response });
    } catch (error) {
      console.log(error);
    }
  }

  async handleRemoveCollection(collectionId) {
    try {
      await removeCollection(collectionId, this.state.user.id);
      this.loadCollections();
    } catch (error) {
      console.log(error);
    }
  }
  handleCreateCollection = async (values) => {
    try {
      let response = await createCollection(values, this.state.user.id);
      this.formRef.current.resetFields();
      this.loadCollections();
    } catch (error) {
      console.log(error);
    }
  };

  async handleEditName(name, collectionId) {
    try {
      await updateCollectionName(collectionId, this.state.user.id, name);
      let copy = [...this.state.list];
      for (let i = 0; i < copy.length; i++) {
        if (copy[i].id == collectionId) {
          copy[i].name = name;
          break;
        }
      }
      this.setState({ list: copy });
    } catch (error) {}
  }

  render() {
    return (
      <AppLayout>
        <div className="container">
          <main>
            <section>
              <h1>Create a new collection</h1>
              <Form
                name="collection"
                layout="inline"
                onFinish={this.handleCreateCollection}
                ref={this.formRef}
              >
                <Form.Item
                  label="Collection name"
                  name="name"
                  rules={[{ required: true, message: "Please enter a name" }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </section>
            <section>
              <div style={{ textAlign: "center" }}>
                <h1>Collections List</h1>
                <List
                  style={{ border: "1px solid #8c5e5878" }}
                  itemLayout="horizontal"
                  dataSource={this.state.list}
                  loading={this.state.loading}
                  renderItem={(collection) => (
                    <List.Item
                      style={{ borderBottom: "1px solid #8c5e5878" }}
                      actions={[
                        <Link
                          href={`/collection/${encodeURIComponent(
                            collection.id
                          )}`}
                        >
                          View/Edit
                        </Link>,
                        <a
                          onClick={() =>
                            this.handleRemoveCollection(collection.id)
                          }
                        >
                          Remove
                        </a>,
                      ]}
                    >
                      <List.Item.Meta
                        style={{
                          textAlign: "left",
                          padding: "0px 20px 0px 20px",
                        }}
                        title={
                          <Paragraph
                            editable={{
                              onChange: (name) =>
                                this.handleEditName(name, collection.id),
                            }}
                          >
                            {collection.name}
                          </Paragraph>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </section>
          </main>
        </div>
      </AppLayout>
    );
  }
}

export default withRouter(Collections);
