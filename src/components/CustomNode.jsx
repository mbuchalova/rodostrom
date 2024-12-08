import './CustomNode.css';


export const CustomNode = ({ node }) => {
  const data = node.getData() || {};
  const { name, gender } = data;

  const imageUrl = gender === 'male'
    ? `${process.env.PUBLIC_URL}/male.png`
    : `${process.env.PUBLIC_URL}/female.png`;

  const handleRenameClick = () => {
    const newName = prompt('Введите новое имя для узла:', name);
    if (newName && newName.trim() !== '') {
      node.setData({ ...data, name: newName });
      node.attr('label/text', newName); // Если у узла есть текстовое поле
    }
  };  

  const handleGenderChange = () => {
    const newGender = gender === 'male' ? 'female' : 'male';
    node.setData({ ...data, gender: newGender }); // Обновляем данные узла
  };

  return (
    <div className="custom-node">
      <img src={imageUrl} alt={gender} className="node-image" />
      <div className="node-name">{name}</div>
      <div className="node-buttons">
        <button
          className="node-button"
          onClick={() => node.model.graph.trigger('node:button-plus:click', { node })}
        >
          +
        </button>
        <button
          className="node-button"
          onClick={() => node.model.graph.trigger('node:button-minus:click', { node })}
        >
          −
        </button>
        <button className="node-button" onClick={handleRenameClick}>
          ✏️
        </button>
        <button className="node-button" onClick={() => handleGenderChange()}>
          🔄
        </button>
      </div>
    </div>
  );
};