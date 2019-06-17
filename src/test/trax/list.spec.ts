import * as assert from 'assert';
import { TestNode, TestList, ArrTestNode, initNewArrTestNode } from './fixture';
import { isBeingChanged, changeComplete, isDataObject, ΔfNbr, Δf, Δlf, Data, ArrayProxy, list } from '../../trax';

describe('Lists', () => {

    const MP_META_DATA = "ΔMd", MP_SELF = "ΔΔSelf";

    it('should support the creation of List of Datasets', async function () {
        let ls = list(TestNode);

        assert.equal(isDataObject(ls), true, "ls is a data object");
        assert.equal(ls[0], null, "get null on undefined item");
        assert.equal(ls.length, 0, "empty list after creation");
        assert.equal(isBeingChanged(ls), false, "list is not mutating after creation");

        let nd1 = new TestNode();
        ls[1] = nd1;

        assert.equal(ls.length, 2, "length is 2");
        assert.equal(isBeingChanged(ls), true, "list is being changed after first set");
        assert.equal(ls[1], nd1, "nd1 at position 1");

        await changeComplete();
        assert.equal(isBeingChanged(ls), false, "ls is now unchanged");
        assert.equal(ls[1], nd1, "nd1 at position 1 in ls");

        nd1.value = "v2";

        assert.equal(isBeingChanged(ls), true, "ls is changed again");
        assert.equal(ls[1]!.value, "v2", "v2 ok");

        await changeComplete();
        assert.equal(isBeingChanged(ls), false, "ls unchanged again");
    });

    it('should support the creation of Lists of Numbers', async function () {
        let ls = list(ΔfNbr);

        assert.equal(ls[0], null, "get null on undefined item");
        assert.equal(ls.length, 0, "empty list after creation");
        assert.equal(isBeingChanged(ls), false, "list is not mutating after creation");

        ls[1] = 18;

        assert.equal(ls.length, 2, "length is 2");
        assert.equal(isBeingChanged(ls), true, "list is mutating after first set");
        assert.equal(ls[1], 18, "18 at position 1");

        await changeComplete();

        assert.equal(isBeingChanged(ls), false, "ls is not mutating after creation");
        assert.equal(ls[1], 18, "18 at position 1 in ls");

        ls[1] = 19;

        assert.equal(isBeingChanged(ls), true, "ls is mutating after item update");
        assert.equal(ls[1], 19, "get(1).value returns 19");

        await changeComplete();

        assert.equal(isBeingChanged(ls), false, "ls is not mutating after creation");
        assert.equal(ls[1], 19, "get(1) is 19");
    });

    it('should accept an array to be set as a list', async function () {
        let f = Δlf(Δf(TestNode));

        let node = new TestList();
        assert.deepEqual(node.list, [], "an empty list is created by default");

        let arr = [
            new TestNode(),
            new TestNode()
        ]
        arr[0].value = "a";
        arr[1].value = "b";
        node.list = arr;

        assert.equal(isBeingChanged(node), true, "node is mutating");
        assert.equal(node.list[0].value, "a", "value 0 is 'a'");
        assert.equal(node.list[1].value, "b", "value 1 is 'b'");

        await changeComplete();
        assert.equal(isBeingChanged(node), false, "node unchanged");
        assert.equal(node.list[0].value, "a", "value is still 'a'");
        assert.equal(node.list[1].value, "b", "value 1 is still 'b'");

        node.list[1].value = "c";
        assert.equal(isBeingChanged(node), true, "node touched");
        assert.equal(isBeingChanged(node.list[0]), false, "node.nodeList[0] touched");
        assert.equal(isBeingChanged(node.list[1]), true, "node.nodeList[1] touched");
        assert.equal(node.list[1].value, "c", "value 1 is 'c'");

    });

    it('should properly update data lists: nothing -> sthV2 -> sthV3 -> null -> null', async function () {
        let node = new ArrTestNode();

        assert.equal(isBeingChanged(node), false, "node unchanged");
        let itemA = new TestNode();
        node.list[0] = itemA;
        itemA.value = "A";

        assert.equal(isBeingChanged(node), true, "node changed");
        await changeComplete();
        assert.equal(isBeingChanged(node), false, "node unchanged (2)");
        assert.equal(node.list[0]!.value, "A", "list[0].value is A");
        assert.equal(node.list.length, 1, "node.list has only one item");

        node.list[0]!.value = "A2";
        await changeComplete();
        assert.equal(node.list[0]!.value, "A2", "list[0].value is now A2");

        node.list[0] = null;
        await changeComplete();
        assert.equal(node.list[0], null, "node list[0] is now null");
        assert.equal(node.list.length, 1, "node list.length is still 1");

        node.list[0] = null;
        assert.equal(isBeingChanged(node), false, "node still unchanged");
    });

    it('should support adding items', async function () {
        let atn = new ArrTestNode();

        assert.equal(atn.list.length, 0, "empty list");
        let item = new TestNode();
        atn.list[0] = item;
        item.value = "item 0";

        assert.equal(atn.list.length, 1, "1 item list");
        assert.equal(atn.list[0]!.value, "item 0", "first item is item 0");

        await changeComplete();
        assert.equal(atn.list.length, 1, "1 item list (2)");
        assert.equal(atn.list[0]!.value, "item 0", "first item is item 0 (2)");

        item = new TestNode();
        atn.list[2] = item;
        item.value = "item 2";
        assert.equal(atn.list.length, 3, "3 items in list");
        assert.equal(atn.list[2]!.value, "item 2", "3rd item is item 2");
    });

    it('should support List.push', async function () {
        let node = new ArrTestNode(), item: TestNode;

        await changeComplete();
        item = new TestNode();
        item.value = "a";
        assert.equal(node.list.length, 0, "empty list");
        assert.equal(isBeingChanged(node), false, "node not mutating");
        node.list.push(item);
        assert.equal(isBeingChanged(node), true, "node now mutating");
        assert.equal(node.list.length, 1, "one item in list");
        assert.equal(isBeingChanged(node), true, "node is mutating");

        await changeComplete();
        item = new TestNode();
        item.value = "b";
        assert.equal(node.list.length, 1, "one item in list");
        assert.equal(node.list[0]!.value, "a", "value0 is a");
        node.list.push(item);
        assert.equal(node.list.length, 2, "two items in list");
        assert.equal(isBeingChanged(node), true, "node is mutating (2)");

        await changeComplete();
        assert.equal(node.list.length, 2, "two items in list (2)");
        assert.equal(node.list[1]!.value, "b", "value1 is b");
    });

    it('should support List.splice', async function () {
        function stringifyList(list) {
            let arr: string[] = [];
            for (let i = 0; list.length > i; i++) {
                itm = list[i];
                arr.push(itm ? itm.value : "null");
            }
            return arr.join("-");
        }

        let node = new ArrTestNode(),
            list = node.list,
            itm: TestNode;
        itm = list[0] = new TestNode();
        itm.value = "i1";
        itm = list[1] = new TestNode();
        itm.value = "i2";
        itm = list[3] = new TestNode();
        itm.value = "i4";

        await changeComplete();
        assert.equal(stringifyList(node.list), "i1-i2-null-i4", "list original content");
        assert.equal(isBeingChanged(node), false, "no change on node");

        node.list.splice(1, 2);
        assert.equal(isBeingChanged(node), true, "splice changed node");

        await changeComplete();
        assert.equal(stringifyList(node.list), "i1-i4", "node.list new content");

        node.list.splice(1, 0, new TestNode()); // insert a new item
        await changeComplete();
        assert.equal(stringifyList(node.list), "i1-v1-i4", "node13.list content");
    });

    it('should support List.forEach', async function () {
        let node = initNewArrTestNode();
        await changeComplete();
        let arr: string[] = [];

        node.list.forEach((value, index, dList) => {
            if (value) {
                arr.push(value.value + "/" + index);
                assert.equal(dList, node.list["ΔΔList"], "list is dList");
            }
        });
        assert.equal(arr.join("-"), "i1/0-i2/1-i3/2", "forEach result");
        assert.equal(isBeingChanged(node), false, "node is unchanged");

        let o = {
            count: 0,
            increment() {
                this.count++;
            }
        }

        node.list.forEach(o.increment, o);
        assert.equal(o.count, 3, "forEach result with thisArg");
        assert.equal(isBeingChanged(node), false, "node is unchanged (2)");
    });

    TestNode.prototype.toString = function () {
        return "TestNode " + this.value;
    }

    it('should support List.filter', async function () {
        let node = initNewArrTestNode();
        await changeComplete();

        let ls = node.list.filter((item: TestNode, index) => {
            return (item.value === "i1") || (index === 2);
        });

        assert.equal(ls.constructor, Array, "ls is an Array");
        assert.equal(Array.isArray(ls), true, "Array.isArray(ls) is true");
        assert.equal(ls.length, 2, "2 items in the list");
        assert.equal(isBeingChanged(node), false, "node11 is unchanged");
        assert.equal(ls.join(','), "TestNode i1,TestNode i3", "ls content");
        assert.equal((ls[0] as any)[MP_META_DATA].parents, node.list[MP_SELF], "list items still have 1 parent");
    });

    // TODO: support array set and create a new proxy automatically

    it('should support toString', async function () {
        let ls = list(Number);

        assert.equal(ls.toString(), "Trax List []", "empty list");

        ls[0] = 123;
        ls[1] = 234;
        assert.equal(ls.toString(), "Trax List [123, 234]", "non-empty list");
    });

    it('should support List.indexOf', async function () {
        let node = initNewArrTestNode();
        await changeComplete();

        let itm1 = node.list[1];
        assert.equal(node.list.indexOf(itm1), 1, "itm1 index is 1");
    });

    it('should support list of lists', async function () {
        @Data class LsNode {
            list: TestNode[][];
        }

        let ls = new LsNode(),
            l0 = (ls.list as ArrayProxy<TestNode[]>).$newItem(),
            l00 = (l0 as ArrayProxy<TestNode>).$newItem();

        assert.equal(ls.list[0][0].value, "v1", "default value 1");
        assert.equal(isBeingChanged(ls.list), true, "l is mutating");
        l00.value = "item 00";
        assert.equal(ls.list[0][0].value, "item 00", "first item can be retrieved");

        await changeComplete();
        assert.equal(isBeingChanged(ls.list), false, "l is mutating");
        assert.equal(ls.list[0][0].value, "item 00", "first item can be retrieved (2)");
    });

    it("should be disposed when not used any longer", async function () {
        let ls = list(TestNode), // ls is a proxy
            nda = ls[0] = new TestNode(),
            ndb = ls[1] = new TestNode();

        nda.value = "a";
        ndb.value = "b";
        await changeComplete();

        assert.equal(ls[0]![MP_META_DATA].parents, ls[MP_SELF], "nda has a ls as parent");

        let arr = ls.$dispose();
        assert.equal(arr.length, 2, "2 items returned");
        assert.equal(arr[0].value, "a", "arr[0] is item a");
        assert.deepEqual(arr[0][MP_META_DATA].parents, undefined, "nda a has no more parents");
    });

});
