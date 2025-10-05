import { gql } from 'graphql-tag';

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    allUsers {
      id
      email
      name
      role
      accountStatus
      lastLogin
      country
      createdAt
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $role: String!) {
    updateUserRole(id: $id, role: $role) {
      id
      email
      name
      role
      accountStatus
      lastLogin
      country
      createdAt
    }
  }
`;

export const UPDATE_ACCOUNT_STATUS = gql`
  mutation UpdateAccountStatus($id: ID!, $status: String!) {
    updateAccountStatus(id: $id, status: $status) {
      id
      email
      name
      role
      accountStatus
      lastLogin
      country
      createdAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;
