package main

type MyError string
func (self MyError) Error() string {
  return string(self)
}

func main() {
  myE := MyError("This is an error.")
  e := *myE.(MyError)
  print("Done")
}
