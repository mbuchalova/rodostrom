import './CustomNode.css';



export const CustomNode = ({ node }) => {
  const data = node.getData() || {};
  const { name, surname, gender, selected } = data;

  const imageUrl = gender === 'male'
    ? `${process.env.PUBLIC_URL}/male.png`
    : `${process.env.PUBLIC_URL}/female.png`;

  const handleRenameClick = () => {
    const newName = prompt('Zadajte nové meno', name);
    if (newName && newName.trim() !== '') {
      node.setData({ ...data, name: newName });
      node.attr('label/text', newName);
    }
  };  

  const handleGenderChange = () => {
    const newGender = gender === 'male' ? 'female' : 'male';
    node.setData({ ...data, gender: newGender }); 
  };

  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`}> 
      <img src={imageUrl} alt={gender} className="node-image" />
      <div className="node-name">{name} {surname}</div>
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