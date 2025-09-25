// Mock AI suggestions service for generating subtasks
import { SubTask } from '../types';

interface AISuggestion {
  subtasks: SubTask[];
  reasoning: string;
}

// Mock AI service that suggests subtasks based on task description
export const generateSubtaskSuggestions = async (taskDescription: string): Promise<AISuggestion> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simple keyword-based suggestion system (mock AI)
  const suggestions: Record<string, SubTask[]> = {
    authentication: [
      { id: 'ai-1', title: 'Set up authentication middleware', completed: false },
      { id: 'ai-2', title: 'Create user registration flow', completed: false },
      { id: 'ai-3', title: 'Implement password validation', completed: false },
      { id: 'ai-4', title: 'Add session management', completed: false },
    ],
    ui: [
      { id: 'ai-5', title: 'Create wireframes and mockups', completed: false },
      { id: 'ai-6', title: 'Implement responsive layout', completed: false },
      { id: 'ai-7', title: 'Add accessibility features', completed: false },
      { id: 'ai-8', title: 'Test on different devices', completed: false },
    ],
    database: [
      { id: 'ai-9', title: 'Analyze query performance', completed: false },
      { id: 'ai-10', title: 'Add database indexes', completed: false },
      { id: 'ai-11', title: 'Implement query caching', completed: false },
      { id: 'ai-12', title: 'Update database schema', completed: false },
    ],
    api: [
      { id: 'ai-13', title: 'Define API endpoints', completed: false },
      { id: 'ai-14', title: 'Write endpoint documentation', completed: false },
      { id: 'ai-15', title: 'Add request/response examples', completed: false },
      { id: 'ai-16', title: 'Create API testing suite', completed: false },
    ],
  };

  const description = taskDescription.toLowerCase();
  let selectedSuggestions: SubTask[] = [];
  let reasoning = '';

  if (description.includes('auth') || description.includes('login')) {
    selectedSuggestions = suggestions.authentication;
    reasoning = 'Detected authentication-related task. Suggested breaking down into user flow, security, and session management components.';
  } else if (description.includes('ui') || description.includes('design') || description.includes('dashboard')) {
    selectedSuggestions = suggestions.ui;
    reasoning = 'Detected UI/design task. Suggested focusing on planning, implementation, accessibility, and testing phases.';
  } else if (description.includes('database') || description.includes('query') || description.includes('performance')) {
    selectedSuggestions = suggestions.database;
    reasoning = 'Detected database/performance task. Suggested analysis, optimization, and caching strategies.';
  } else if (description.includes('api') || description.includes('documentation') || description.includes('endpoint')) {
    selectedSuggestions = suggestions.api;
    reasoning = 'Detected API documentation task. Suggested comprehensive documentation approach including examples and testing.';
  } else {
    // Generic suggestions
    selectedSuggestions = [
      { id: 'ai-generic-1', title: 'Research and planning', completed: false },
      { id: 'ai-generic-2', title: 'Implementation phase 1', completed: false },
      { id: 'ai-generic-3', title: 'Testing and validation', completed: false },
      { id: 'ai-generic-4', title: 'Documentation and cleanup', completed: false },
    ];
    reasoning = 'Generated generic task breakdown following standard development workflow.';
  }

  return {
    subtasks: selectedSuggestions,
    reasoning,
  };
};