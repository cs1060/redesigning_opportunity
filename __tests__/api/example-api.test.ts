/**
 * Example API test file
 * 
 * This demonstrates how to test Next.js API routes.
 * Replace with actual tests for your API routes.
 */

import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

// This is a placeholder handler - in real tests, you would import your actual API handler
const exampleHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Success' });
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
};

describe('Example API Route', () => {
  it('should return 200 for GET requests', async () => {
    // Arrange
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });
    
    // Act
    await exampleHandler(req, res);
    
    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Success' });
  });

  it('should return 405 for non-GET methods', async () => {
    // Arrange
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });
    
    // Act
    await exampleHandler(req, res);
    
    // Assert
    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Method not allowed' });
  });
});
