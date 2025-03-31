import styled from 'styled-components';
import React, { useState } from 'react';

const Search = () => {
  const [query, setQuery] = useState('');  // Define the query state

  return (
    <PageContainer>
      <Heading>Search</Heading>
      <SearchRow>
        <SearchInput
          type="text"
          placeholder="Prague"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <IconButton>❤️</IconButton>
        <IconButton>➕</IconButton>
      </SearchRow>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 40px;
  margin: 0;
`;

const Heading = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1c1c1c;
  margin-bottom: 24px;
`;

const SearchRow = styled.div`
  display: flex;
  align-items: top;
  gap: 16px;
  background-color: white;
  border: 2px solid #d8d8d8;
  border-radius: 999px;
  padding: 8px 16px;
  max-width: 5000px;
  width: 100%;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  font-size: 18px;
  outline: none;
  padding: 6px;

  &::placeholder {
    color: #b4b4b4;
  }
`;

const IconButton = styled.button`
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #3b5bdb;

  &:hover {
    opacity: 0.8;
  }
`;

export default Search;
