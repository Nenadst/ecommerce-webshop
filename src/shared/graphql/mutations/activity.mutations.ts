import { gql } from '@apollo/client';

export const CREATE_ACTIVITY_LOG = gql`
  mutation CreateActivityLog($input: ActivityLogInput!) {
    createActivityLog(input: $input) {
      id
      userId
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
