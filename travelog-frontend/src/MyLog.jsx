import React from 'react';
import styled from 'styled-components';

const MyLog = () => {
  return (
    <Container>
      <Heading>My Log Page</Heading>
      <p>This is your personal log where you can track your trips.</p>
    </Container>
  );
};

const Container = styled.div`
  margin-left: 50px;
`;

const Heading = styled.h1`
  font-size: 36px;
`;

export default MyLog;
