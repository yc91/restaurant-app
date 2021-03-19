import React, { useEffect } from "react";
import Link from "next/link";
import { withRouter } from "next/router";
import {
  Select,
  List,
  Card,
  Pagination,
  Row,
  Col,
  Divider,
  Input,
  TimePicker,
  DatePicker,
  Button,
  Form,
} from "antd";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";

import AppLayout from "../components/layout";
import {
  getUser,
  getCollections,
  getAllRestaurants,
  getRestaurantFromCollection,
  addRestaurantToCollection,
  removeRestaurantFromCollection,
} from "../lib/api";

const { Option } = Select;

export async function getServerSideProps(ctx) {
  return {
    props: { query: ctx.query }, // will be passed to the page component as props
  };
}

class Home extends React.Component {
  state = {
    restaurant: [],
    pagination: {},
    loading: false,
    hasMore: true,
    user: null,
    loggedIn: false,
    collections: [],
    restaurantCollection: null,
  };

  async componentDidMount() {
    //reset query params when loaded
    this.props.router.replace("/", undefined, { shallow: true });
    //get data
    this.handleGetAllRestaurant();
    this.initalLoad();
  }

  async componentDidUpdate(prevProps, prevState) {
    const { pathname, query } = this.props.router;
    // verify props have changed to avoid an infinite loop
    if (
      query.page !== prevProps.router.query.page ||
      query.count !== prevProps.router.query.count ||
      query.name !== prevProps.router.query.name ||
      query.date !== prevProps.router.query.date ||
      query.time !== prevProps.router.query.time
    ) {
      // fetch data based on the new query
      this.handleGetAllRestaurant(query);
    }
  }

  async initalLoad() {
    try {
      let user = await getUser();
      this.setState({ loggedIn: true, user: user.user }, () => {
        this.loadCollections();
        this.loadRestaurantCollections();
      });
    } catch (error) {
      console.log(error);
    }
  }

  async handleGetAllRestaurant(query = null) {
    try {
      let response = await getAllRestaurants(query);
      this.setState({
        restaurant: response.data.data.data,
        pagination: response.data.data.pagination,
        loading: false,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async loadCollections() {
    try {
      let collections = await getCollections(this.state.user.id);
      let selectArr = [];
      //transform collections data to push into select components
      for (let i = 0; i < collections.length; i++) {
        selectArr.push(
          <Option key={collections[i].id}>{collections[i].name}</Option>
        );
      }
      this.setState({ collections: selectArr });
    } catch (error) {
      console.log(error);
    }
  }

  async loadRestaurantCollections() {
    try {
      let restaurantCollection = await getRestaurantFromCollection(
        this.state.user.id
      );
      this.setState({ restaurantCollection: restaurantCollection });
    } catch (error) {
      console.log(error);
    }
  }

  async handleAddRestaurantToCollection(selections, restaurantId) {
    //check and prevent duplicate values;
    let duplicate = false;
    for (var i = 0; i < this.state.restaurantCollection.length; i++) {
      if (
        this.state.restaurantCollection[i].restaurant_id == restaurantId &&
        this.state.restaurantCollection[i].collection_id ==
          value[value.length - 1]
      )
        duplicate = true;
    }

    if (!duplicate) {
      try {
        await addRestaurantToCollection(
          selections[selections.length - 1],
          restaurantId
        );
        this.loadRestaurantCollections();
      } catch (error) {
        console.log(error);
      }
    }
  }

  async handleRemoveRestaurantFromCollection(collectionId, restaurantId) {
    try {
      await removeRestaurantFromCollection(collectionId, restaurantId);
      this.loadRestaurantCollections();
    } catch (error) {
      console.log(error);
    }
  }

  nextPage = (page, pageSize) => {
    let str = "/?page=" + page + "&count=" + pageSize;
    if (this.props.router.query.name)
      str += "&name=" + this.props.router.query.name;
    if (this.props.router.query.time)
      str += "&time=" + this.props.router.query.time;
    if (this.props.router.query.date)
      str += "&date=" + this.props.router.query.date;

    this.props.router.push(str, undefined, { shallow: true });
  };

  search = async (values) => {
    let query = { page: 1, count: this.state.pagination.perPage };
    if (values.name) query.name = values.name;
    if (values.date) query.date = values.date;
    if (values.time) query.time = values.time;
    //add search values to query param
    let params = Object.keys(query)
      .map(
        (element) =>
          encodeURIComponent(element) + "=" + encodeURIComponent(query[element])
      )
      .join("&");

    this.props.router.replace("/?" + params, undefined, { shallow: true });
  };

  render() {
    return (
      <AppLayout>
        <div className="container">
          <main>
            <section>
              <Divider orientation="left" plain>
                Filter Restaurant by
              </Divider>
              <Row
                gutter={16}
                style={{
                  padding: "1.5rem 1.5rem 1.5rem 1.5rem",
                  background: "#fff",
                  marginBottom: "1rem",
                  boxShadow: "1px 1px #888888",
                }}
              >
                <Form name="search" layout="inline" onFinish={this.search}>
                  <Form.Item name="name" label="Name">
                    <Input allowClear={true} placeholder="Search by name" />
                  </Form.Item>

                  <Form.Item name="date" label="Open on">
                    <DatePicker />
                  </Form.Item>

                  <Form.Item name="time" label="During">
                    <TimePicker use12Hours format="h:mm a" />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SearchOutlined />}
                    >
                      Search
                    </Button>
                  </Form.Item>
                </Form>
              </Row>
            </section>
            <section>
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 4,
                  lg: 4,
                  xl: 6,
                  xxl: 3,
                }}
                dataSource={this.state.restaurant}
                loading={this.state.loading}
                pagination={{
                  total: this.state.pagination.total,
                  defaultPageSize: this.state.pagination.perPage,
                  defaultCurrent: this.state.pagination.currentPage,
                  current: this.state.pagination.currentPage,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                  position: "both",
                  onChange: this.nextPage,
                }}
                renderItem={(restaurant) => (
                  <List.Item>
                    <Card
                      title={restaurant.name}
                      actions={
                        this.state.loggedIn && this.state.restaurantCollection
                          ? [
                              <Select
                                mode="multiple"
                                allowClear
                                style={{ width: "100%" }}
                                placeholder="Add to collections"
                                defaultValue={() => {
                                  let arr = [];
                                  for (
                                    var i = 0;
                                    i < this.state.restaurantCollection.length;
                                    i++
                                  ) {
                                    if (
                                      this.state.restaurantCollection[i]
                                        .restaurant_id == restaurant.id
                                    ) {
                                      arr.push(
                                        String(
                                          this.state.restaurantCollection[i]
                                            .collection_id
                                        )
                                      );
                                    }
                                  }
                                  return arr;
                                }}
                                onChange={(selections, option) =>
                                  this.handleAddRestaurantToCollection(
                                    selections,
                                    restaurant.id
                                  )
                                }
                                onDeselect={(collectionId) =>
                                  this.handleRemoveRestaurantFromCollection(
                                    collectionId,
                                    restaurant.id
                                  )
                                }
                              >
                                {this.state.collections}
                              </Select>,
                            ]
                          : [<p>Please login to add to collections</p>]
                      }
                    >
                      {restaurant.description.split("/").map((opening) => (
                        <p> {opening} </p>
                      ))}
                    </Card>
                  </List.Item>
                )}
              />
            </section>
          </main>
        </div>
        <style global jsx>{`
          .ant-list-pagination {
            margin: 24px 0px 24px 0;
            text-align: center;
          }
          .ant-picker {
            width: 100%;
          }
        `}</style>
      </AppLayout>
    );
  }
}

export default withRouter(Home);
