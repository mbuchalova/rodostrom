import React, { useEffect, useRef, useState } from 'react';
import { Graph } from '@antv/x6';

const FamilyTree = () => {
  const containerRef = useRef(null);
  const [graph, setGraph] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const g = new Graph({
      container: containerRef.current,
      width: 800,
      height: 600,
      grid: true,
    });

    // Инициализация начальных узлов
    const initialNodes = [
      { id: 'me', label: 'Я', x: 300, y: 250 },
    ];

    initialNodes.forEach((node) => {
      g.addNode({
        id: node.id,
        x: node.x,
        y: node.y,
        width: 80,
        height: 40,
        attrs: {
          label: { text: node.label, fill: '#000' },
          body: { stroke: '#5F95FF', strokeWidth: 1 },
        },
      });
    });

    // Обработчик клика по узлу
    g.on('node:click', ({ node }) => {
      // Сброс выделения всех узлов
      g.getNodes().forEach((n) => {
        n.attr('body/stroke', '#5F95FF');
      });
      // Выделение выбранного узла
      node.attr('body/stroke', '#FF0000');
      setSelectedNode(node);
    });

    setGraph(g);
  }, []);

  const addAncestor = () => {
    if (!graph || !selectedNode) return;

    const newId = `ancestor-${Date.now()}`;
    const { x, y } = selectedNode.position();

    // Добавление нового узла предка
    const newNode = graph.addNode({
      id: newId,
      x: x - 100,
      y: y - 100,
      width: 80,
      height: 40,
      attrs: {
        label: { text: 'Предок', fill: '#000' },
        body: { stroke: '#5F95FF', strokeWidth: 1 },
      },
    });

    // Добавление связи между предком и выбранным узлом
    graph.addEdge({
      source: newNode,
      target: selectedNode,
      attrs: {
        line: { stroke: '#A2B1C3', strokeWidth: 2 },
      },
    });
  };

  const removeSelectedNode = () => {
    if (!graph || !selectedNode) return;

    // Удаление выбранного узла и связанных с ним связей
    graph.removeCell(selectedNode);
    setSelectedNode(null);
  };

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

  return (
    <div>
      <button onClick={addAncestor} disabled={!selectedNode}>Добавить предка</button>
      <button onClick={removeSelectedNode} disabled={!selectedNode}>Удалить выбранный узел</button>
      <button onClick={renameSelectedNode} disabled={!selectedNode}>Переименовать узел</button>
      {isRenaming && (
        <div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button onClick={handleRename}>Сохранить</button>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
};

export default FamilyTree;
