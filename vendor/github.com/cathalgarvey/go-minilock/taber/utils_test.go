package taber

import (
	"fmt"
	"testing"
)

func VPrint(things ...interface{}) {
	if testing.Verbose() {
		fmt.Println(things...)
	}
}

func TestChunkify(t *testing.T) {
	input := []byte("123456789012345678901234567890112345678901234567890123456789012345678901")
	cs := chunkify(input, 31)
	if len(cs[0]) != 31 || len(cs[1]) != 31 || len(cs[2]) != 10 {
		VPrint("Expected lengths 31, 31, 10 for chunked slice, got: ", len(cs[0]), len(cs[1]), len(cs[2]))
		VPrint("Input: ", input)
		VPrint("cs: ", cs)
		t.Fail()
	}
}
