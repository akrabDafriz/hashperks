function ListGroup() {
  let test_items = ["Apple", "Samsung", "Advan", "Coca Cola"];
  //test_items = []

  // const getMessage =()=>{
  //   return test_items.length === 0 ? <p>No items found</p> : null 
  // } 

  return (
    <>
      <h1>List</h1>
        {test_items.length === 0 && <p>No items found</p> }
      <ul className="list-group">
        {test_items.map((item) => (
          <li className="list-group-item"key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;

/* <li className="list-group-item">An item</li>
<li className="list-group-item">A second item</li>
<li className="list-group-item">A third item</li>
<li className="list-group-item">A fourth item</li>
<li className="list-group-item">And a fifth one</li> */
