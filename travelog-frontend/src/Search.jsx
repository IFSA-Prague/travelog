import styled, { keyframes } from 'styled-components';
import React, { useState } from 'react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Search = () => {
  const [query, setQuery] = useState('');

  return (
    <PageContainer>
      <Card>
        <Heading>Search</Heading>
        <SearchRow>
          <SearchInput
            type="text"
            placeholder="Search for a city (e.g., Prague)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <IconButton title="Bookmark">❤️</IconButton>
          <IconButton title="Add">➕</IconButton>
        </SearchRow>
      </Card>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 64px);
  margin-top: 64px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  animation: ${fadeIn} 0.5s ease-out;
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Heading = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24px;
  text-align: center;
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  border: 2px solid #d8d8d8;
  border-radius: 999px;
  padding: 12px 20px;
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
