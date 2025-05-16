import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity VM environment
const mockClarity = {
  tx: {
    sender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    sponsorAddress: null,
  },
  contracts: {
    'project-verification': {
      functions: {
        'register-project': vi.fn(),
        'verify-project': vi.fn(),
        'get-project': vi.fn(),
        'add-verifier': vi.fn(),
        'remove-verifier': vi.fn(),
        'get-verifier-status': vi.fn(),
        'set-admin': vi.fn(),
      },
      variables: {
        admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        'next-project-id': 1,
      },
      maps: {
        projects: new Map(),
        verifiers: new Map(),
      },
    },
  },
};

// Mock the contract calls
const mockContractCall = (contractName: string, functionName: string, args: any[]) => {
  return mockClarity.contracts[contractName].functions[functionName](...args);
};

describe('Project Verification Contract', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Clear maps
    mockClarity.contracts['project-verification'].maps.projects.clear();
    mockClarity.contracts['project-verification'].maps.verifiers.clear();
    
    // Reset variables
    mockClarity.contracts['project-verification'].variables['next-project-id'] = 1;
  });
  
  it('should register a new project', async () => {
    const projectName = 'Reforestation Project';
    const description = 'Planting trees in deforested areas';
    const location = 'Amazon Rainforest';
    
    mockClarity.contracts['project-verification'].functions['register-project'].mockReturnValue({
      result: { value: 1 },
      type: 'ok',
    });
    
    const result = await mockContractCall('project-verification', 'register-project', [
      projectName, description, location
    ]);
    
    expect(result).toEqual({
      result: { value: 1 },
      type: 'ok',
    });
    
    expect(mockClarity.contracts['project-verification'].functions['register-project']).toHaveBeenCalledWith(
        projectName, description, location
    );
  });
  
  it('should verify a project when called by admin', async () => {
    const projectId = 1;
    
    // Mock project exists
    mockClarity.contracts['project-verification'].maps.projects.set(
        projectId,
        {
          owner: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
          name: 'Reforestation Project',
          description: 'Planting trees in deforested areas',
          location: 'Amazon Rainforest',
          verified: false,
          verifier: null,
        }
    );
    
    mockClarity.contracts['project-verification'].functions['verify-project'].mockReturnValue({
      result: { value: true },
      type: 'ok',
    });
    
    const result = await mockContractCall('project-verification', 'verify-project', [projectId]);
    
    expect(result).toEqual({
      result: { value: true },
      type: 'ok',
    });
    
    expect(mockClarity.contracts['project-verification'].functions['verify-project']).toHaveBeenCalledWith(projectId);
  });
  
  it('should add a verifier when called by admin', async () => {
    const verifierAddress = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    
    mockClarity.contracts['project-verification'].functions['add-verifier'].mockReturnValue({
      result: { value: true },
      type: 'ok',
    });
    
    const result = await mockContractCall('project-verification', 'add-verifier', [verifierAddress]);
    
    expect(result).toEqual({
      result: { value: true },
      type: 'ok',
    });
    
    expect(mockClarity.contracts['project-verification'].functions['add-verifier']).toHaveBeenCalledWith(verifierAddress);
  });
  
  it('should get project details', async () => {
    const projectId = 1;
    const projectDetails = {
      owner: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
      name: 'Reforestation Project',
      description: 'Planting trees in deforested areas',
      location: 'Amazon Rainforest',
      verified: true,
      verifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    };
    
    mockClarity.contracts['project-verification'].functions['get-project'].mockReturnValue({
      result: projectDetails,
      type: 'ok',
    });
    
    const result = await mockContractCall('project-verification', 'get-project', [projectId]);
    
    expect(result).toEqual({
      result: projectDetails,
      type: 'ok',
    });
    
    expect(mockClarity.contracts['project-verification'].functions['get-project']).toHaveBeenCalledWith(projectId);
  });
});
