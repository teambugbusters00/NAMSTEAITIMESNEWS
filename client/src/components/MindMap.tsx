import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Loader2 } from 'lucide-react';

// Custom node types with styled components

const RootNode = ({ data }: NodeProps) => (
  <div className="px-6 py-4 bg-gradient-to-br from-[#1a1a2e] to-[#d4380d] rounded-xl shadow-xl border-2 border-orange-500 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="!bg-orange-500" />
    <p className="text-white text-sm font-bold text-center font-serif leading-tight">{String(data.label)}</p>
    <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
  </div>
);

const CenterNode = ({ data }: NodeProps) => (
  <div className="px-5 py-3 bg-white border-2 border-[#1a1a2e] rounded-lg shadow-lg min-w-[180px]">
    <Handle type="target" position={Position.Top} className="!bg-[#1a1a2e]" />
    <p className="text-[#1a1a2e] text-xs font-bold text-center font-sans">{String(data.label)}</p>
    <Handle type="source" position={Position.Bottom} className="!bg-[#1a1a2e]" />
  </div>
);

const BranchNode = ({ data }: NodeProps) => (
  <div className="px-4 py-2.5 bg-[#faf9f6] border-2 border-[#d4380d]/30 rounded-lg shadow-md hover:shadow-lg transition-shadow min-w-[150px]">
    <Handle type="target" position={Position.Top} className="!bg-[#d4380d]" />
    <p className="text-[#1a1a2e] text-xs font-semibold text-center font-serif">{String(data.label)}</p>
    <Handle type="source" position={Position.Bottom} className="!bg-[#d4380d]" />
  </div>
);

const LeafNode = ({ data }: NodeProps) => (
  <div className="px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:border-[#d4380d] transition-colors min-w-[120px]">
    <Handle type="target" position={Position.Top} className="!bg-gray-400" />
    <p className="text-gray-700 text-[10px] text-center font-sans">{String(data.label)}</p>
  </div>
);

const nodeTypes = {
  root: RootNode,
  center: CenterNode,
  branch: BranchNode,
  leaf: LeafNode,
};

interface MindMapProps {
  articleData: {
    headline: string;
    category: string;
    summary: string[];
    keyPlayers: string[];
    arc: string[];
  };
}

interface MindMapNode {
  id: string;
  type: 'root' | 'center' | 'branch' | 'leaf';
  text: string;
  x?: number;
  y?: number;
}

interface MindMapEdge {
  source: string;
  target: string;
}

export default function MindMap({ articleData }: MindMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchMindMap = useCallback(async () => {
    // Validate data before making API call
    if (!articleData || !articleData.headline) {
      setError('Article data is missing. Please select an article first.');
      return;
    }

    if (!articleData.summary || !Array.isArray(articleData.summary) || articleData.summary.length === 0) {
      setError('Article summary is missing or empty.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { auth } = await import('../firebase/firebase');
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Not authenticated. Please sign in first.');
      }

      const token = await user.getIdToken();
      
      console.log('🧠 Mind Map Request:', {
        headline: articleData.headline,
        category: articleData.category,
        summaryCount: articleData.summary?.length || 0,
        keyPlayersCount: articleData.keyPlayers?.length || 0,
        arcCount: articleData.arc?.length || 0
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mindmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          headline: articleData.headline,
          category: articleData.category || 'General',
          summary: articleData.summary,
          keyPlayers: articleData.keyPlayers || [],
          arc: articleData.arc || []
        }),
      });

      // Log response status for debugging
      console.log('📡 Mind Map Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Mind Map API Error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to generate mind map');
      }

      const data = await response.json();
      
      console.log('📊 Mind Map Response:', data);

      // Validate the response structure
      if (!data.success) {
        throw new Error(data.error || data.details || 'Mind map generation failed');
      }

      if (!data.mindMap || !data.mindMap.nodes || !data.mindMap.edges) {
        console.error('❌ Invalid mind map structure:', data);
        throw new Error('Invalid mind map data received from server');
      }

      // Convert LLM response to React Flow nodes
      const flowNodes = data.mindMap.nodes.map((node: MindMapNode) => ({
        id: node.id,
        type: node.type || 'center',
        position: { x: node.x || 400, y: node.y || 50 },
        data: { label: node.text || node.id },
      }));

      // Convert LLM response to React Flow edges
      const flowEdges = data.mindMap.edges.map((edge: MindMapEdge, index: number) => ({
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        style: { stroke: '#d4380d', strokeWidth: 2 },
        type: 'smoothstep',
      }));

      // Validate that we have at least some nodes
      if (flowNodes.length === 0) {
        throw new Error('No nodes generated for mind map');
      }

      console.log('✅ Mind Map Generated:', {
        nodeCount: flowNodes.length,
        edgeCount: flowEdges.length
      });

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      console.error('❌ Mind map error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate mind map visualization';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [articleData, setNodes, setEdges]);

  useEffect(() => {
    // Only fetch if we have valid data
    if (articleData?.headline && articleData?.summary?.length > 0) {
      fetchMindMap();
    } else {
      setError('No article data available to generate mind map');
    }
  }, [articleData, fetchMindMap]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-[#faf9f6]">
        <Loader2 className="w-8 h-8 text-[#d4380d] animate-spin mb-4" />
        <p className="text-gray-600 text-sm font-sans">Generating intelligence visualization...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-[#faf9f6] p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-sm font-sans mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchMindMap();
            }}
            className="px-4 py-2 bg-[#1a1a2e] text-white text-xs rounded hover:bg-black transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-[500px] bg-[#faf9f6] border border-gray-200 rounded-sm">
      {nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No mind map data available</p>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-left"
        >
          <Controls className="!bg-white !border-gray-200 !shadow-md" />
          <Background color="#e5e0d8" gap={20} />
        </ReactFlow>
      )}
    </div>
  );
}