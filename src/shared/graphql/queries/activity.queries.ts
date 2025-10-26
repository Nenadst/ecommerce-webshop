import { gql } from '@apollo/client';

export const GET_USER_ACTIVITY_LOGS = gql`
  query GetUserActivityLogs($userId: ID!, $limit: Int, $fromDate: String, $toDate: String) {
    userActivityLogs(userId: $userId, limit: $limit, fromDate: $fromDate, toDate: $toDate) {
      id
      userId
      userName
      user {
        id
        email
        name
      }
      action
      description
      ipAddress
      userAgent
      path
      metadata
      createdAt
    }
  }
`;

export const GET_ALL_ACTIVITY_LOGS = gql`
  query GetAllActivityLogs($limit: Int) {
    allActivityLogs(limit: $limit) {
      id
      userId
      userName
      user {
        id
        email
        name
      }
      action
      description
      ipAddress
      userAgent
      path
      metadata
      createdAt
    }
  }
`;
