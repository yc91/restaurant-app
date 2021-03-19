import React, { useEffect } from "react";
import Link from "next/link";
import { withRouter } from "next/router";
import { Select, List, Card, Tooltip} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";


import AppLayout from "../../components/layout";
import { getUser, getRestaurantFromOneCollection, removeRestaurantFromCollection } from "../../lib/api";

class Collection extends React.Component {
  state = {
    loading: true,
    user: null,
    collection: null,
    loggedIn: false,
    restaurantCollection: [],
    collectionLoaded: false
  };

  async componentDidMount() {
    this.loadUser();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.router.query.id && this.state.user && !this.state.collectionLoaded) {
        this.loadRestaurant();
    }
  }

  async loadUser(){
    try{
      let response = await getUser();
      this.setState({ loggedIn: true, user: response.user });
    }catch (error){
      this.props.router.push("/entry");
    }
  }

  async loadRestaurant(){
    try{
       let response = await getRestaurantFromOneCollection(this.state.user.id, this.props.router.query.id);
       this.setState({ restaurantCollection: response, collectionLoaded: true, loading: false });
    }catch (error) {
      console.log(error);
    }
  }

  async handleRemoval(restaurantId){
    try{
      await removeRestaurantFromCollection(this.props.router.query.id, restaurantId);
      this.loadRestaurant();
    }catch (error){
      console.log(error);
    }
  }


  render() {
    return (
      <AppLayout>
        <div className="container">
          <main>
            <Link href="/collection"><a>Back</a></Link>
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
                style={{marginTop:'3rem'}}
                dataSource={this.state.restaurantCollection}
                loading={this.state.loading}
                renderItem={(restaurant) => (
                  <List.Item>
                    <Card
                      title={restaurant.name}
                      extra={<Tooltip title="Remove"><DeleteOutlined style={{cursor: 'pointer'}} onClick={() => this.handleRemoval(restaurant.id)}/></Tooltip>}
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

export default withRouter(Collection);
