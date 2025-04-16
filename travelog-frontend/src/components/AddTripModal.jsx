import React, { useState } from 'react';
import styled from 'styled-components';

const AddTripModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    accommodation: '',
    favoriteRestaurants: '',
    favoriteAttractions: '',
    otherNotes: '',
    media: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10); // max 10 files
    setFormData(prev => ({
      ...prev,
      media: files
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submission = new FormData();

    // Add user_id from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      submission.append('user_id', user.id);
    }

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "media") {
        value.forEach((file) => submission.append("media", file));
      } else {
        submission.append(key, value);
      }
    });

    onSubmit(submission);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h2>Add New Trip</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>City *</Label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Country *</Label>
            <Input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Trip Dates *</Label>
            <DateContainer>
              <DateInput
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
              <DateInput
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </DateContainer>
          </FormGroup>

          <FormGroup>
            <Label>Accommodation</Label>
            <Input
              type="text"
              name="accommodation"
              value={formData.accommodation}
              onChange={handleChange}
              placeholder="Hotel/Hostel/Airbnb/etc."
            />
          </FormGroup>

          <FormGroup>
            <Label>Favorite Restaurants</Label>
            <TextArea
              name="favoriteRestaurants"
              value={formData.favoriteRestaurants}
              onChange={handleChange}
              placeholder="List your favorite restaurants..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Favorite Scenic Visits / Attractions</Label>
            <TextArea
              name="favoriteAttractions"
              value={formData.favoriteAttractions}
              onChange={handleChange}
              placeholder="List your favorite attractions..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Other Notes</Label>
            <TextArea
              name="otherNotes"
              value={formData.otherNotes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Upload Photos or Videos (up to 10)</Label>
            <Input
              type="file"
              name="media"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaChange}
            />
          </FormGroup>

          <ButtonGroup>
            <SubmitButton type="submit">Add Trip</SubmitButton>
            <CancelButton type="button" onClick={onClose}>Cancel</CancelButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  line-height: 1;

  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const DateContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const DateInput = styled(Input)`
  flex: 1;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  flex: 1;
`;

const SubmitButton = styled(Button)`
  background-color: #007bff;
  color: white;
  border: none;

  &:hover {
    background-color: #0056b3;
  }
`;

const CancelButton = styled(Button)`
  background-color: #6c757d;
  color: white;
  border: none;

  &:hover {
    background-color: #545b62;
  }
`;

export default AddTripModal; 