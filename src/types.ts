export interface InterfaceDefinition {
  name: string;
  type: 'grpc' | 'protobuf' | 'typescript' | 'openapi';
  code: string;
  description: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  type: 'kernel' | 'bus' | 'storage' | 'client' | 'cloud' | 'security' | 'intelligence';
  description: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label: string;
  bidirectional?: boolean;
}

export interface ArchitectureDiagramData {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface SpecDocument {
  id: string;
  title: string;
  subtitle: string;
  purpose: string;
  overview: string;
  responsibilities: string[];
  architecture: {
    text: string;
    diagram: ArchitectureDiagramData;
    ascii?: string;
  };
  interfaces: InterfaceDefinition[];
  internalWorkflow: string[];
  dependencies: string[];
  failureCases: {
    scenario: string;
    impact: string;
    mitigation: string;
  }[];
  security: string[];
  scalability: string[];
  futureExpansion: string[];
  decisionSummary: {
    alternatives: string[];
    selected: string;
    justification: string;
  };
}

export interface GlossaryItem {
  term: string;
  definition: string;
  subsystem: string;
}
