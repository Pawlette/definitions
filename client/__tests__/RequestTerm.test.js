import React from 'react';
import 'jest-dom/extend-expect'
import RequestForm from '../src/Forms/RequestForm';
import { render, fireEvent, waitForElement} from 'react-testing-library';
const domTestingLib = require('dom-testing-library')
const { queries } = domTestingLib
import * as customQueries from '../src/utils/test-utils'

const mockResponse = (data, status = 200) => jest.fn().mockReturnValue(
  Promise.resolve({
    status: status,
    json: () => Promise.resolve(data)
  })
)
global.fetch = mockResponse();

it('Renders form and submit term', async () => {
  // Arrange
  const defaultQueries = customQueries.default
  const { getByText, getByTestId } = render(<RequestForm />,
    { queries: { ...queries, ...defaultQueries }, })
  const requestForm = getByTestId('request-form')
  const inputTerm = getByTestId('request-input')
  const submitButton = getByText(/Submit/)
  // Act
  fireEvent.submit(requestForm)

  // Assert
  const inputError = await waitForElement(() => getByText(/This is a required question/));
  expect(inputError).toBeVisible()
  expect(inputError).toHaveClass('errorMessage')
  expect(inputTerm.value).toBe('')
  expect(submitButton).toBeVisible()

  // Act
  fireEvent.change(inputTerm, {target: {value: 'Queer'}})

  // Assert
  expect(inputTerm.value).toBe('Queer')

  // Act
   await fireEvent.submit(requestForm)
  
   // Assert
  expect(fetch).toHaveBeenCalledWith('/requested/Queer', {
    method: 'POST',
  });
  expect(inputTerm.value).toBe('')

  // Arrange
  const snackbar = await waitForElement(() => getByText(/Your request for Queer was successful/).parentElement)
  expect(snackbar).toBeVisible()
  expect(snackbar).toHaveClass('queerSnackbar')
  const snackbarDismissBttn = snackbar.querySelector('button')
  expect(snackbarDismissBttn.innerHTML).toBe('Dismiss')

  // Act
  fireEvent.click(snackbarDismissBttn)
  try {
    await waitForElement(() => getByText(/Your request for Queer was successful/))
  } catch (e) {
    // Assert
    expect(e.message).toBe('Unable to find the element')
  }

  // Assert
  expect(requestForm).not.toContainElement(snackbar)
});
