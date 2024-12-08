import React, { useEffect, useRef, useState } from 'react';
import { Graph } from '@antv/x6';
import { register } from '@antv/x6-react-shape'
import './FamilyTree.css';
import {CustomNode} from './CustomNode';
import AncestorSearch from './AncestorSearch';
import sampleData from '../sample.json';
import Modal from './Modal';

register({
  shape: 'custom-react-node',
  width: 100,
  height: 100,
  zIndex: 10,
  component: CustomNode,
})

const FamilyTree = () => {
  // handlers for x6 graph
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [graph, setGraph] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [parentNode, setParentNode] = useState(null);

  let isPanning = false;
  let startPoint = null;
  let startPosition = null;
  let initialTranslate = { x: 0, y: 0 };
  let isDragging = false;
  let draggingNode = null;

  // handle search modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // export graph as json
  const exportGraph = () => {
    if (graph) {
      const data = graph.toJSON();
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Экспортированные данные графа:', jsonString);
      // Здесь вы можете сохранить jsonString в файл или отправить на сервер
    }
  };

  // import graph from json
  const importGraph = (jsonString) => {
    if (graph) {
      try {
        const data = JSON.parse(jsonString);
        graph.fromJSON(data);
        console.log('Граф успешно импортирован');
      } catch (error) {
        console.error('Ошибка при импорте графа:', error);
      }
    }
  };

  const addNode = (data) => {
    if (!graph || !parentNode) return;

    const { x, y } = parentNode.position();
    const newNode = graph.addNode({
      shape: 'custom-react-node',
      x: x + 150,
      y,
      data,
    });
    graph.addEdge({
      source: parentNode,
      target: newNode,
      zIndex: 1,
    });

    setIsModalOpen(false); // Close the modal after adding the node
    setParentNode(null);
  };

  useEffect(() => {
    const g = new Graph({
      container: containerRef.current,
      autoResize: true,
      background: {
        color: '#edf0f4',
      },
      grid: {
        size: 10,
        visible: true,
      },
      interacting: {
        nodeMovable: false,
      }
    });
    graphRef.current = g;

    const initialNode = g.addNode({
      shape: 'custom-react-node',
      x: 300,
      y: 250,
      width: 100,
      height: 40,
      component: CustomNode,
      data: {
        name: 'Me',
        gender: 'female',
      }
    });

    // Panning and dragging

    g.on('node:mousedown', ({ e, node }) => {
      console.log("mousedown")
      isDragging = true;
      draggingNode = node; // Сохраняем узел
      startPosition = { x: e.clientX, y: e.clientY };
    });

    g.on('node:mousemove', ({ e }) => {
      console.log("mousemove")
      if (isDragging && startPosition && draggingNode) {
        const dx = e.clientX - startPosition.x;
        const dy = e.clientY - startPosition.y;
        startPosition = { x: e.clientX, y: e.clientY };

        const position = draggingNode.position();
        draggingNode.position(position.x + dx, position.y + dy);
      }
    });

    g.on('node:mouseup', () => {
      console.log("mouseup")
      isDragging = false; // Сбрасываем флаг перетаскивания
      draggingNode = null; // Сбрасываем текущий узел
      startPosition = null; // Очищаем начальную позицию
    });

    g.on('blank:mousedown', ({ e }) => {
      if (e.button === 0) { // Проверяем левую кнопку мыши
        isPanning = true;
        startPoint = { x: e.clientX, y: e.clientY };
        // Сохраняем текущие координаты графа
        const currentTranslate = g.translate();
        initialTranslate = { x: currentTranslate.tx, y: currentTranslate.ty };
      }
    });

    g.on('blank:mousemove', ({ e }) => {
      const dx = e.clientX - startPoint.x;
      const dy = e.clientY - startPoint.y;
      // Устанавливаем новое смещение относительно начального положения
      g.translate(initialTranslate.x + dx, initialTranslate.y + dy);
    });

    g.on('blank:mouseup', () => {
      isPanning = false;
      startPoint = null;
    });

    g.on('node:click', ({ node }) => {
      // Сбрасываем выделение у всех узлов
      g.getNodes().forEach((n) => {
        n.attr('body/stroke', '#d9dad7'); // Возвращаем стандартный цвет
        n.attr('body/strokeWidth', 2);
      });
    
      // Устанавливаем выделение для текущего узла
      node.attr('body/stroke', '#FF0000'); // Красная рамка
      node.attr('body/strokeWidth', 4); // Толщина рамки
    });

    // Обработка нажатия на кнопку "плюс"
    g.on('node:button-plus:click', ({ node }) => {
      console.log('button-plus:click')
      setParentNode(node);
      setIsModalOpen(true);
    });

    // Обработка нажатия на кнопку "минус"
    g.on('node:button-minus:click', ({ node }) => {
      g.removeNode(node);
    });

    setGraph(g);
    g.fromJSON(sampleData);

    handleZoomOut();
    g.centerContent();
  }, []);

  const renameSelectedNode = () => {
    if (!selectedNode) return;
    setIsRenaming(true);
    setNewName(selectedNode.attr('label/text'));
  };

  const handleRename = () => {
    if (selectedNode && newName.trim()) {
      selectedNode.attr('label/text', newName);
      setIsRenaming(false);
    }
  };

  const handleZoomIn = () => {
    const zoom = graphRef.current.zoom();
    console.log(zoom)
    graphRef.current.zoomTo(zoom + 0.2);
  };
  
  const handleZoomOut = () => {
    const zoom = graphRef.current.zoom();
    console.log(zoom)
    graphRef.current.zoomTo(zoom - 0.2);
  };

  return (
    <section className="family-tree-section">
      <div id="container" className="family-tree-container">
      <div className="zoom-controls">
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>−</button>
      </div>
      <button onClick={exportGraph}>Export graph</button>
        <button
          onClick={() => {
            const jsonString = prompt('Insert json for import:');
            if (jsonString) {
              importGraph(jsonString);
            }
          }}
        >
          Import graph
        </button>
        <button onClick={renameSelectedNode} disabled={!selectedNode}>Rename node</button>
        {isRenaming && (
          <div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={handleRename}>Save</button>
          </div>
        )}
        <div ref={containerRef} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AncestorSearch onSelect={addNode}/>
      </Modal>
      
    </section>
    
    
  );
};

export default FamilyTree;