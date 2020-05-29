import React, { Component } from "react";
//Icons
import { IoIosPerson, IoMdLock } from "react-icons/all";

// graphQl imports
import gql from "graphql-tag";
import { Mutation } from "react-apollo";

export default class LogIn extends Component {
  state = {
    email: "",
    password: "",
    error: {
      status: false,
      message: "",
    },
  };
  render() {
    const {
      email,
      password,
      error: { status, message },
    } = this.state;

    const LOGIN_MUTATION = gql`
      mutation LoginMutation($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          user {
            email
            first_name
            last_name
            email
            phone_number
          }
        }
      }
    `;
    return (
      <div className="form-fields">
        <div className="user-email input-fields">
          <IoIosPerson />
          <input
            name="email"
            type="text"
            placeholder="Email"
            value={email}
            onChange={(event) => this.setState({ email: event.target.value })}
          />
        </div>
        <div className="user-password input-fields">
          <IoMdLock />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              this.setState({ password: event.target.value })
            }
          />
        </div>
        {status && <p>{message}</p>}
        <Mutation
          mutation={LOGIN_MUTATION}
          variables={{ email, password }}
          onCompleted={(data) => {
            this._authoriedUser(data);
            this.setState({
              email: "",
              password: "",
            });
          }}
          onError={(error) => {
            this.setState({
              error: {
                message: error.message.split(":")[1],
                status: true,
              },
            });
          }}
        >
          {(mutation) => (
            <div className="login-button" onClick={mutation}>
              Login
            </div>
          )}
        </Mutation>
      </div>
    );
  }

  _authoriedUser(data) {
    console.log(data);
    console.log(this.props);
  }
}