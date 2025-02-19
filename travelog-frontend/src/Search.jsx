import React from 'react';
import styled from 'styled-components';

const Search = () => {
  return (
    <Container>
      <Heading>Search Page</Heading>
      <p>Search for other users and connect with friends!</p>
    </Container>
  );
};

const Container = styled.div`
  margin-left: 50px;
`;

const Heading = styled.h1`
  font-size: 36px;
`;

export default Search;
